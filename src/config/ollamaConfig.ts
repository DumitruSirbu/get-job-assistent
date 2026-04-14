export const ollamaConfig = {
    host: process.env.OLLAMA_HOST ?? 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL ?? 'gemma4',
};
