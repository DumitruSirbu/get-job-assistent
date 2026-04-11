export const normalizeStringValue = (value?: string): string | undefined => {
    return value?.trim().toLowerCase();
};
