import { useEffect, useState } from "react"
import { Link } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { CustomSpinner } from "@/shared/components/CustomSpinner";
import { type ModuleKeys } from "@/interfaces/components/modules";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { SecurityRoleRequest } from "@/interfaces/requests/security-role.request";
import type { SecurityRoleResponse } from "@/interfaces/responses/security-role.response";
import { SecurityRolePermissionsGrid } from "../../../components/SecurityRolePermissionsGrid";
import type { SecurityRolePermissionRequest } from "@/interfaces/requests/security-role-permission.request";

interface Props {
    isSubmitting: boolean,
    securityRoleResponse?: SecurityRoleResponse,
    onSubmit: (securityRoleRequestLike: Partial<SecurityRoleRequest>) => void
}

export const SecurityRoleForm = ({ isSubmitting, securityRoleResponse, onSubmit }: Props) => {

    // Use react hook form configuration
    const { control, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<Partial<SecurityRoleRequest>>({
        defaultValues: {
            name: isValidValueWithDefault(securityRoleResponse?.name, ""),
            description: isValidValueWithDefault(securityRoleResponse?.description, ""),
            isActive: isValidValueWithDefault(securityRoleResponse?.isActive, false),
            permissions: isValidValueWithDefault(securityRoleResponse?.permissions, [])
        }
    });
    const [permissions, setPermissions] = useState<SecurityRolePermissionRequest[]>(watch("permissions") ?? []);

    useEffect(() => {
        requestAnimationFrame(() => {
            reset({
                name: isValidValueWithDefault(securityRoleResponse?.name, ""),
                description: isValidValueWithDefault(securityRoleResponse?.description, ""),
                isActive: isValidValueWithDefault(securityRoleResponse?.isActive, false),
                permissions: isValidValueWithDefault(securityRoleResponse?.permissions, [])
            })
        });
    }, [securityRoleResponse]);

    // Component functions
    const handleOnChangePermission = (key: ModuleKeys, permission: "can-read" | "can-write" | "can-delete", checked: boolean) => {
        let updatedPermissions: SecurityRolePermissionRequest[] = [];
        if (!permissions.some(item => item.moduleKey === key)) {
            updatedPermissions = [...permissions, {
                moduleKey: key,
                canRead: permission === "can-read",
                canWrite: permission === "can-write",
                canDelete: permission === "can-delete"
            }];
        } else {
            updatedPermissions = permissions.map((item) => {
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
        requestAnimationFrame(() => { 
            setValue("permissions", updatedPermissions);
            setPermissions(updatedPermissions);
        });
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6">

                {/* General section */}
                <SectionTitle
                    title="INFORMACIÓN GENERAL DEL ROL DE SEGURIDAD"
                    description="Registro de información básica del rol de seguridad." />

                <div className="flex items-center flex-col gap-y-8">

                    <div className="control-container">
                        <label className="label">Nombre del rol de seguridad:</label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    value={field.value}
                                    onChange={field.onChange}
                                    type="text"
                                    placeholder="Nombre del rol de seguridad..."
                                />
                            )} />
                        {
                            errors.name && (
                                <p className="text-red-500 text-sm mt-2">
                                    El nombre del rol de seguridad es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="control-container">
                        <label className="label">¿Registro activo?:</label>
                        <div className="flex items-center justify-center">
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-transparent dark:bg-muted/40 border border-border cursor-pointer transition-colors">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{field.value ? "Activo" : "Inactivo"}</p>
                                            <p className="text-xs text-muted-foreground mt-1">El rol de seguridad se encuentra activo o inactivo.</p>
                                        </div>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </label>
                                )}
                            />
                        </div>
                    </div>

                    <div className="control-container">
                        <label className="label">Descripción del rol de seguridad:</label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="-"
                                />
                            )}
                        />
                    </div>

                </div>

                {/* Permissions section */}
                <SectionTitle
                    title="CONFIGURACIÓN DE PRIVILEGIOS DEL ROL DE SEGURIDAD"
                    description="Ajusta los diferentes privilegios en los módulos del sistema que el rol de seguridad tendrá." />

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
