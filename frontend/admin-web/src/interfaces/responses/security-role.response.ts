import type { SecurityRolePermissionResponse } from "./security-role-permission.response";

/**
 * Type: Response
 * Description: Represents the security role
 */
export interface SecurityRoleResponse {
    /**
     * Security role unique identifier
     */
    id: string;
    /**
     * Security role name
     */
    name: string;
    /**
     * Security role description
     */
    description: string;
    /**
     * Security role is active flag
     */
    isActive: boolean;
    /**
     * Security role's permissions list
     */
    permissions?: SecurityRolePermissionResponse[];
}
