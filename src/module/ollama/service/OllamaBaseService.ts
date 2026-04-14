import { Logger } from '@nestjs/common';
import { IOllamaChatResponse } from '../interface';

export abstract class OllamaBaseService {
    protected readonly logger: Logger;

    protected constructor(
        protected readonly host: string,
        protected readonly model: string,
    ) {
        this.logger = new Logger(this.constructor.name);
    }

    protected async askForJson<T>(prompt: string): Promise<T> {
        const url = `${this.host}/api/chat`;

        this.logger.log(`Calling Ollama model "${this.model}" at ${url}`);

        let response: Response;
        try {
            response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: this.model,
                    stream: false,
                    messages: [{ role: 'user', content: prompt }],
                }),
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

        this.logger.log('Received response from Ollama, parsing JSON');

        try {
            const json = this.extractJson(rawContent);
            return JSON.parse(json) as T;
        } catch (error) {
            this.logger.error('Failed to parse Ollama response as JSON', rawContent);
            throw error;
        }
    }

    private extractJson(content: string): string {
        const trimmed = content.trim();
        const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        return match ? match[1].trim() : trimmed;
    }
}
