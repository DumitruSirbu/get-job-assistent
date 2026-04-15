export interface IPaginated<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
}

export function paginate<T>(items: T[], total: number, page: number, limit: number): IPaginated<T> {
    return { items, total, page, limit };
}
