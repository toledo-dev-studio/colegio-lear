export interface PagedResponse<T> {
    data: T[];
    totalPages: number;
    currentPage: number;
    itemsCount: number;
}

