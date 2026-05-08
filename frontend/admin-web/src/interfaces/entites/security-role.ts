import type { SecurityRolePermission } from "./security-role-permission";

export interface SecurityRole {
    id: string;
    name: string;
    description: string;
    status: boolean;
    permissions?: SecurityRolePermission[];
}
