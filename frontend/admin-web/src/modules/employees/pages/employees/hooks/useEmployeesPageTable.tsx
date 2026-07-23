import { Link } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";

interface Options {
    handleClickDelete: (item: EmployeeResponse) => void;
}

export const useEmployeesPageTable = ({ handleClickDelete }: Options) => {
    // Check permissions
    const canDelete = usePermission("employees", "can-delete");

    // Table columns configuration structure
    const columns: string[] = [
        "Nombre completo",
        "Correo electrónico",
        "Puesto de trabajo",
        "Rol asignado",
        "¿Registro activo?",
        "Acciones",
    ];

    // Table properties value configuration structure
    const properties: TableProperty<EmployeeResponse>[] = [
        {
            key: "name",
            render: ({ id, name, firstLastName, secondLastName }: EmployeeResponse) => (
                <Link to={`/employees/${id}`}>
                    <span className="text-primary">
                        {`${isValidValueWithDefault(name, "")} ${isValidValueWithDefault(firstLastName, "")} ${isValidValueWithDefault(secondLastName, "")}`}
                    </span>
                </Link>
            )
        },
        { key: "email" },
        {
            key: "jobTitle",
            render: ({ jobTitle }: EmployeeResponse) => jobTitle?.name
        },
        {
            key: "securityRole",
            render: ({ securityRole }: EmployeeResponse) => securityRole?.name
        },
        {
            key: "isActive",
            render: ({ isActive }: EmployeeResponse) => (
                <Badge variant={isActive ? "success" : "destructive"} className="py-4 px-6">
                    {
                        isActive ? "Activo" : "Inactivo"
                    }
                </Badge>
            )
        }
    ];

    // Table actions list
    const actions: TableAction<EmployeeResponse>[] = [
        {
            key: "edit",
            render: ({ id }: EmployeeResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <Link to={`/employees/${id}`}>
                            <span className="bg-primary text-white icon-btn icon-btn-sm">
                                <Pencil className="w-4 h-4" />
                            </span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar empleado</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "delete",
            render: (item: EmployeeResponse) => (
                canDelete && 
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-destructive text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickDelete(item)}>
                            <Trash className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar empleado</p>
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
