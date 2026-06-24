import type { ModuleKey } from "@/lib/key-value-pairs/key-value-pair-modules";

/**
 * Type: Request
 * Description: Represents the permissions for a security role
 */
export interface SecurityRolePermissionRequest {
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
    moduleKey: ModuleKey;
}
