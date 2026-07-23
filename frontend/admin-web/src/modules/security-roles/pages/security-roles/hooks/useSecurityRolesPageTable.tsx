import { Link } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { SecurityRoleResponse } from "@/interfaces/responses/security-role.response";
import { usePermission } from "@/modules/auth/hooks/usePermission";

interface Options {
    handleClickDelete: (item: SecurityRoleResponse) => void;
}

export const useSecurityRolesPageTable = ({ handleClickDelete }: Options) => {
    // Check permissions
    const canDelete = usePermission("security-roles", "can-delete");

    // Table columns configuration structure
    const columns: string[] = [
        "Nombre",
        "Descripción",
        "¿Registro activo?",
        "Acciones",
    ];

    // Table properties value configuration structure
    const properties: TableProperty<SecurityRoleResponse>[] = [
        {
            key: "name",
            render: ({ id, name }: SecurityRoleResponse) => (
                <Link to={`/security-roles/${id}`}>
                    <span className="text-primary">
                        {name}
                    </span>
                </Link>
            )
        },
        { key: "description" },
        {
            key: "isActive",
            render: ({ isActive }: SecurityRoleResponse) => (
                <Badge variant={isActive ? "success" : "destructive"} className="py-4 px-6">
                    {
                        isActive ? "Activo" : "Inactivo"
                    }
                </Badge>
            )
        }
    ];

    // Table actions list
    const actions: TableAction<SecurityRoleResponse>[] = [
        {
            key: "edit",
            render: ({ id }: SecurityRoleResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <Link to={`/security-roles/${id}`}>
                            <span className="bg-primary text-white icon-btn icon-btn-sm">
                                <Pencil className="w-4 h-4" />
                            </span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar rol de seguridad</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "delete",
            render: (item: SecurityRoleResponse) => (
                canDelete &&
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-destructive text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickDelete(item)}>
                            <Trash className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar rol de seguridad</p>
                    </TooltipContent>
                </Tooltip>
            )
        }
    ];

    return {
        columns,
        properties,
        actions
    }
}
