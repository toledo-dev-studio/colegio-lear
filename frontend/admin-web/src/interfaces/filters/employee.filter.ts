import type { JobTitleFilter } from "./job-title.filter";
import type { SecurityRoleFilter } from "./security-role.filter";

/**
 * Type: Filter
 * Description: Represents an employee of the school, containing their personal information, contact details, status, and references to related entities such as their job title and security role.
 */
export interface EmployeeFilter {
    /**
     * Employee full name
     */
    fullName?: string;
    /**
     * Employee is active flag
     */
    isActive?: boolean;
    /**
     * Security role unique identifier
     */
    securityRoleId?: string;
    /**
     * Reference to the associated security role
     */
    securityRole?: Partial<SecurityRoleFilter>;
    /**
     * Job title unique identifier
     */
    jobTitleId: string;
    /**
     * Reference to the associated job title
     */
    jobTitle?: Partial<JobTitleFilter>;
}
