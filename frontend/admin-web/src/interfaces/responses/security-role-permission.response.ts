import type { ModuleKeys } from "@/interfaces/components/modules";

/**
 * Type: Response
 * Description: Represents the permissions for a security role
 */
export interface SecurityRolePermissionResponse {
    /**
     * Can read module permission
     */
    canRead: boolean;
    /**
     * Can write module permission
     */
    canWrite: boolean;
    /**
     * Can delete module permission
     */
    canDelete: boolean;
    /**
     * Module key unique identifier
     */
    moduleKey: ModuleKeys;
}
