export const toArray = ({ value }: { value: unknown }) => (Array.isArray(value) ? value : value !== undefined ? [value] : undefined);
