/**
 * Type: Response
 * Description: Represents a paged response of generic entity
 */
export interface PagedResponse<T> {
    /**
     * Generic entity data list
     */
    data: T[];
    /**
     * Pagination total pages count
     */
    totalPages: number;
    /**
     * Pagination current page
     */
    currentPage: number;
    /**
     * Pagination items count in current page
     */
    itemsCount: number;
}
