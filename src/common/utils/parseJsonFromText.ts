export function parseJsonFromText<T>(content: string): T {
    const trimmed = content.trim();
    const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    const fencedPayload = fenced ? fenced[1].trim() : null;

    if (fencedPayload) {
        try {
            return JSON.parse(fencedPayload) as T;
        } catch {
            // fall through to brace-substring fallback
        }
    } else {
        try {
            return JSON.parse(trimmed) as T;
        } catch {
            // fall through to brace-substring fallback
        }
    }

    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
        return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)) as T;
    }

    throw new SyntaxError('Could not extract JSON object from text');
}
