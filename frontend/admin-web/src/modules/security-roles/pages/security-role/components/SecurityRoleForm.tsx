import { useEffect, useState } from "react"
import { Link } from "react-router";
import { useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { CustomSpinner } from "@/shared/components/CustomSpinner";
import { type ModuleKeys } from "@/interfaces/components/modules";
import type { SecurityRole } from "@/interfaces/entites/security-role";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { SecurityRolePermission } from "@/interfaces/entites/security-role-permission";
import { SecurityRolePermissionsGrid } from "../../../components/SecurityRolePermissionsGrid";

interface Props {
    securityRole?: SecurityRole,
    isSubmitting: boolean,
    onSubmit: (securityRoleLike: Partial<SecurityRole>) => void
}

export const SecurityRoleForm = ({ securityRole, isSubmitting, onSubmit }: Props) => {

    const { register, handleSubmit, formState: { errors }, getValues, setValue, watch, reset } = useForm<Partial<SecurityRole>>({
        defaultValues: securityRole
    });
    const [permissions, setPermissions] = useState<SecurityRolePermission[]>(getValues("permissions") ?? []);

    useEffect(() => {
        if (securityRole)
            reset(securityRole);
    }, [securityRole]);

    const handleOnChangePermission = (key: ModuleKeys, permission: "can-read" | "can-write" | "can-delete", checked: boolean) => {
        const currentPermissions = getValues("permissions") ?? [];
        let newPermissions: SecurityRolePermission[] = [];
        if (!currentPermissions.some(item => item.moduleKey === key)) {
            newPermissions = [...currentPermissions, {
                moduleKey: key,
                canRead: permission === "can-read",
                canWrite: permission === "can-write",
                canDelete: permission === "can-delete"
            }];
        } else {
            newPermissions = currentPermissions.map((item) => {
                if (item.moduleKey !== key)
                    return item;
                switch (permission) {
                    case "can-read":
                        item.canRead = checked;
                        break;
                    case "can-write":
                        item.canWrite = checked;
                        break;
                    case "can-delete":
                        item.canDelete = checked;
                        break;
                    default:
                        break;
                }
                return item;
            });
        }
        setValue("permissions", newPermissions);
        setPermissions(newPermissions);
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6">

                <div className="flex flex-col items-start gap-y-4 md:items-center md:flex-row md:justify-between border-b border-border pb-4">
                    <h2 className="w-full text-muted-foreground">
                        INFORMACIÓN GENERAL DEL ROL DE SEGURIDAD
                    </h2>
                    <div className="w-fit flex items-center">
                        <Tooltip>
                            <TooltipTrigger>
                                <Switch
                                    size="default"
                                    checked={watch("status") ?? false}
                                    onCheckedChange={(checked) => setValue("status", checked)} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Estatus del registro</p>
                            </TooltipContent>
                        </Tooltip>

                    </div>
                </div>

                <div className="flex items-center flex-col gap-y-8">

                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-3 block">
                            Nombre del rol de seguridad <span className="text-destructive">*</span>:
                        </label>
                        <Input
                            type="text"
                            {...register("name", { required: true })}
                            placeholder="Nombre del registro..."
                            className="pill-input w-full pl-8" />
                        {
                            errors.name && (
                                <p className="text-red-500 text-sm mt-2">
                                    El nombre del rol de seguridad es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-3 block">Descripción del rol de seguridad:</label>
                        <Textarea
                            {...register("description")}
                            defaultValue={getValues("description")}
                            placeholder="Descripción del registro..."
                            className="pill-input w-full pl-8" />
                    </div>

                </div>

                <div className="flex flex-col items-start gap-y-4 md:items-center md:flex-row md:justify-between border-b border-border pb-4 mt-4">
                    <h2 className="w-full text-muted-foreground">
                        CONFIGURACIÓN DE PRIVILEGIOS DEL ROL DE SEGURIDAD
                    </h2>
                </div>

                <SecurityRolePermissionsGrid
                    disabled={false}
                    permissions={permissions}
                    handleOnChangePermission={handleOnChangePermission}>
                </SecurityRolePermissionsGrid>

                {/* Actions Buttons */}
                <section className="flex items-center justify-end mt-8 gap-x-4 border-t border-border pt-8">
                    <Link to="/security-roles">
                        <Button type="button" disabled={isSubmitting} aria-label="cancel" variant={"ghost"}>
                            Cancelar
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting} aria-label="save-record">
                        Guardar
                        {
                            isSubmitting && (<CustomSpinner variant="primary" className="ml-4" />)
                        }
                    </Button>
                </section>

            </form>
        </>
    )
}
