export interface IOllamaChatResponse {
    message: {
        role: string;
        content: string;
        thinking?: string;
    };
    done?: boolean;
    done_reason?: string;
}
