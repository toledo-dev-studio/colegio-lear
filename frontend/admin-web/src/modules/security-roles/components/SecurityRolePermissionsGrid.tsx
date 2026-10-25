import { cn } from "@/lib/extensions/utils";
import { Switch } from "@/shared/shadcn/ui/switch";
import { AVAILABLE_MODULES, type ModuleKey } from "@/lib/key-value-pairs/key-value-pair-modules";
import type { SecurityRolePermissionRequest } from "@/interfaces/requests/security-role-permission.request";

interface Props {
    disabled: boolean;
    permissions: SecurityRolePermissionRequest[];
    handleOnChangePermission?: (key: ModuleKey, permission: "can-read" | "can-write" | "can-delete", checked: boolean) => void;
}

export const SecurityRolePermissionsGrid = ({ disabled = false, permissions = [], handleOnChangePermission }: Props) => {
    const isPermissionChecked = (moduleKey: ModuleKey, permission: "can-read" | "can-write" | "can-delete") => {
        return permissions.some(item => item.moduleKey === moduleKey && (permission === "can-read" ? item.canRead : permission === "can-write" ? item.canWrite : item.canDelete));
    }

    const renderPermission = (moduleKey: ModuleKey, modulePermission: boolean | undefined, label: string, permission: "can-read" | "can-write" | "can-delete", asRow = false) => {
        if (!modulePermission)
            return null;

        const labelElement = <p className="text-xs text-muted-foreground">{label}</p>;
        const switchElement = <Switch disabled={disabled} size="sm" onCheckedChange={(checked) => handleOnChangePermission?.(moduleKey, permission, checked)} checked={isPermissionChecked(moduleKey, permission)} />;

        if (asRow)
            return (
                <div className="flex items-center justify-between gap-4">
                    {labelElement}
                    {switchElement}
                </div>
            );

        return (
            <div className="flex flex-col gap-1.5 min-w-fit">
                {labelElement}
                {switchElement}
            </div>
        );
    }

    return (
        <>
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full min-w-fit bg-muted/30 rounded-2xl border border-border py-2 border-separate border-spacing-0">
                    <tbody>
                        {
                            AVAILABLE_MODULES.map((module, index) => (
                                <tr key={module.key} className="w-full text-sm">
                                    <td className={cn("border-r py-4 pl-8", index !== (AVAILABLE_MODULES.length - 1) && "border-b")}>
                                        <div className="flex flex-col gap-y-1 min-w-48">
                                            <p className="text-xs text-muted-foreground">Módulo:</p>
                                            <p className="font-medium text-foreground">{module.label}</p>
                                        </div>
                                    </td>
                                    <td className={cn("w-full py-4 px-8", index !== (AVAILABLE_MODULES.length - 1) && "border-b border-border")}>
                                        <div className="flex flex-row items-center justify-start gap-x-8">
                                            {renderPermission(module.key, module.permissions.canRead, "¿Puede leer?", "can-read")}
                                            {renderPermission(module.key, module.permissions.canWrite, "¿Puede escribir?", "can-write")}
                                            {renderPermission(module.key, module.permissions.canDelete, "¿Puede eliminar?", "can-delete")}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>

                </table>
            </div>

            <div className="md:hidden flex flex-col gap-3">
                {
                    AVAILABLE_MODULES.map((module) => (
                        <div key={module.key} className="rounded-2xl border border-border bg-muted/30 p-4">
                            <p className="text-sm font-medium text-foreground mb-3">{module.label}</p>
                            <div className="flex flex-col gap-y-4">
                                {renderPermission(module.key, module.permissions.canRead, "¿Puede leer?", "can-read", true)}
                                {renderPermission(module.key, module.permissions.canWrite, "¿Puede escribir?", "can-write", true)}
                                {renderPermission(module.key, module.permissions.canDelete, "¿Puede eliminar?", "can-delete", true)}
                            </div>
                        </div>
                    ))
                }
            </div>
        </>
    )
}