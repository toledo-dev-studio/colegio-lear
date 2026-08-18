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
    return (
        <>
            <div className="overflow-x-auto">
                <table className="w-full min-w-180 bg-muted/30 rounded-2xl border border-border py-2 border-separate border-spacing-0">
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

                                            {
                                                module.permissions.canRead && (
                                                    <div className="flex flex-col gap-1.5 min-w-fit">
                                                        <p className="text-xs text-muted-foreground">¿Puede leer?</p>
                                                        <Switch disabled={disabled} size="sm" onCheckedChange={(checked) => handleOnChangePermission?.(module.key, "can-read", checked)} checked={permissions.some(item => item.moduleKey === module.key && item.canRead)} />
                                                    </div>
                                                )
                                            }

                                            {
                                                module.permissions.canWrite && (
                                                    <div className="flex flex-col gap-1.5 min-w-fit">
                                                        <p className="text-xs text-muted-foreground">¿Puede escribir?</p>
                                                        <Switch disabled={disabled} size="sm" onCheckedChange={(checked) => handleOnChangePermission?.(module.key, "can-write", checked)} checked={permissions.some(item => item.moduleKey === module.key && item.canWrite)} />
                                                    </div>
                                                )
                                            }

                                            {
                                                module.permissions.canDelete && (
                                                    <div className="flex flex-col gap-1.5 min-w-fit">
                                                        <p className="text-xs text-muted-foreground">¿Puede eliminar?</p>
                                                        <Switch disabled={disabled} size="sm" onCheckedChange={(checked) => handleOnChangePermission?.(module.key, "can-delete", checked)} checked={permissions.some(item => item.moduleKey === module.key && item.canDelete)} />
                                                    </div>
                                                )
                                            }
                                        </div>
                                    </td>
                                </tr>
                            ))
                        }
                    </tbody>

                </table>
            </div>
        </>
    )
}
