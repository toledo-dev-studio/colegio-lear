import type { Navbar } from "@/interfaces/components/navbar";
import type { SecurityRolePermission } from "@/interfaces/entites/security-role-permission";

export const filterNavbarByPermissions = (navbar: Navbar[], permissions: SecurityRolePermission[]): Navbar[] => {
    // Convert permissions to Set for fast lookup O(1)
    const allowedModules = new Set(
        permissions
            .filter((p) => p.canRead)
            .map((p) => p.moduleKey)
    );

    return navbar
        .map((section) => ({
            ...section,
            // Keep only allowed modules
            items: section.items.filter((item) =>
                allowedModules.has(item.module.key)
            ),
        }))
        // Remove empty sections
        .filter((section) => section.items.length > 0);
};
