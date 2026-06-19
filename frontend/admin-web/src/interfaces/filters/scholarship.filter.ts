/**
 * Type: Filter
 * Description: Represents a scholarship within the school, containing details about the scholarship's name, description, discount percentage, and status.
 */
export interface ScholarshipFilter {
    /**
     * Name of the scholarship
     * Example: "Beca de excelencia académica"
     */
    name?: string;
    /**
     * Discount percentage provided by the scholarship
     * This field represents the percentage of discount that the scholarship provides on tuition fees. For example, a value of 50 means a 50% discount on tuition fees for students who are awarded this scholarship.
     */
    discountPercentage?: number;
    /**
     * Indicates if the scholarship is active
     */
    isActive?: boolean;
}
