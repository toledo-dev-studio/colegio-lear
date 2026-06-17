import type { SecurityRolePermissionRequest } from "./security-role-permission.request";

/**
 * Type: Request
 * Description: Represents the security role
 */
export interface SecurityRoleRequest {
    /**
     * Security role name
     */
    name: string;
    /**
     * Security role description
     */
    description?: string;
    /**
     * Security role is active flag
     */
    isActive: boolean;
    /**
     * Security role's permissions list, it can be an empty list
     */
    permissions?: SecurityRolePermissionRequest[];
}
