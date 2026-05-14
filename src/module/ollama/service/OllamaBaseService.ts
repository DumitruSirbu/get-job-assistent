import { Logger } from '@nestjs/common';
import { Agent } from 'undici';
import { parseJsonFromText } from 'src/common/utils/parseJsonFromText';
import { IOllamaChatResponse } from '../interface';

export interface IOllamaPrompt {
    system?: string;
    user: string;
    schema?: Record<string, unknown>;
}

interface IOllamaChatMessage {
    role: 'system' | 'user';
    content: string;
}

// Ollama's default num_ctx is 2048, which truncates JSON output when the
// system + user prompt occupy most of the window. Bump to 8192 to leave
// ~1500+ tokens for the model's reply; cap predicted tokens to keep latency
// bounded.
const OLLAMA_CONTEXT_TOKENS = 8192;
const OLLAMA_MAX_OUTPUT_TOKENS = 2048;

// Local LLM inference on a 20B+ model can take minutes per request,
// especially on cold start with a large context window. Node's undici
// fetch defaults to 5 min headersTimeout, which trips before the model
// finishes prefill. Use a dedicated agent with a generous ceiling.
const OLLAMA_REQUEST_TIMEOUT_MS = 15 * 60 * 1000;

const ollamaAgent = new Agent({
    headersTimeout: OLLAMA_REQUEST_TIMEOUT_MS,
    bodyTimeout: OLLAMA_REQUEST_TIMEOUT_MS,
    connectTimeout: 30 * 1000,
});

export abstract class OllamaBaseService {
    protected readonly logger: Logger;

    protected constructor(
        protected readonly host: string,
        protected readonly model: string,
    ) {
        this.logger = new Logger(this.constructor.name);
    }

    protected async askForJson<T>(prompt: IOllamaPrompt): Promise<T> {
        const url = `${this.host}/api/chat`;

        this.logger.log(`Calling Ollama model "${this.model}" at ${url}`);

        const messages: IOllamaChatMessage[] = [];
        if (prompt.system) {
            messages.push({ role: 'system', content: prompt.system });
        }
        messages.push({ role: 'user', content: prompt.user });

        let response: Response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    stream: false,
                    format: prompt.schema ?? 'json',
                    // Gemma 4 and other reasoning models default to "thinking"
                    // mode, emitting a long internal chain into a separate
                    // `thinking` field and leaving `content` empty until the
                    // budget runs out. We want the structured answer directly.
                    think: false,
                    messages,
                    options: {
                        num_ctx: OLLAMA_CONTEXT_TOKENS,
                        num_predict: OLLAMA_MAX_OUTPUT_TOKENS,
                    },
                }),
                // @ts-expect-error dispatcher is a Node fetch (undici) extension not in lib.dom
                dispatcher: ollamaAgent,
            });
        } catch (error) {
            this.logger.error('Failed to reach Ollama - is it running?', error);
            throw error;
        }

        if (!response.ok) {
            const body = await response.text();
            const err = new Error(`Ollama responded with ${response.status}: ${body}`);
            this.logger.error(err.message);
            throw err;
        }

        const data = (await response.json()) as IOllamaChatResponse;
        const rawContent = data.message.content;

        if (data.done_reason === 'length') {
            const thinkingPreview = data.message.thinking ? ` Thinking preview: ${data.message.thinking.slice(0, 500)}` : '';
            this.logger.error(
                `Ollama response hit the num_predict cap (${OLLAMA_MAX_OUTPUT_TOKENS} tokens). Output preview: ${rawContent.slice(0, 1000)}${thinkingPreview}`,
            );
            throw new Error(`Ollama output truncated at num_predict=${OLLAMA_MAX_OUTPUT_TOKENS}`);
        }

        this.logger.log('Received response from Ollama, parsing JSON');

        try {
            return parseJsonFromText<T>(rawContent);
        } catch (error) {
            this.logger.error(`Failed to parse Ollama response as JSON. Preview: ${rawContent.slice(0, 200)}`);
            throw error;
        }
    }
}
