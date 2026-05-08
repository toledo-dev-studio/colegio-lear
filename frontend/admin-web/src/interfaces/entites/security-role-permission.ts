import type { ModuleKeys } from "@/interfaces/components/modules";

export interface SecurityRolePermission {
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    moduleKey: ModuleKeys;
}
