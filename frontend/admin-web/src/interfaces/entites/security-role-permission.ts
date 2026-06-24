import type { ModuleKey } from "@/lib/key-value-pairs/key-value-pair-modules";

export interface SecurityRolePermission {
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    moduleKey: ModuleKey;
}
