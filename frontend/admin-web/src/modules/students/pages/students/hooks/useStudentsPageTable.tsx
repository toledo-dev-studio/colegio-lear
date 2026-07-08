import { Link } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { StudentResponse } from "@/interfaces/responses/student.response";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";

interface Options {
    handleClickDelete: (item: StudentResponse) => void;
}

export const useStudentsPageTable = ({ handleClickDelete }: Options) => {
    // Table columns configuration structure
    const columns: string[] = [
        "Matricula",
        "CURP",
        "Email",
        "Teléfono",
        "¿Registro activo?",
        "Acciones"
    ];

    // Table properties value configuration structure
    const properties: TableProperty<StudentResponse>[] = [
        {
            key: "name",
            render: ({ id, enrollment, name, firstLastName, secondLastName }: StudentResponse) => (
                <Link to={`/students/${id}`}>
                    <span className="text-primary">
                        {enrollment}
                    </span>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">{`${name} ${firstLastName} ${secondLastName}`}</div>
                </Link>
            )
        },
        { key: "curp" },
        { key: "email" },
        { key: "phoneNumber" },
        {
            key: "isActive",
            render: ({ isActive }: StudentResponse) => (
                <Badge variant={isActive ? "default" : "destructive"} className="py-4 px-6">
                    {
                        isActive ? "Activo" : "Inactivo"
                    }
                </Badge>
            )
        }
    ];

    // Table actions list
    const actions: TableAction<StudentResponse>[] = [
        {
            key: "edit",
            render: ({ id }: StudentResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <Link to={`/students/${id}`}>
                            <span className="bg-primary text-white icon-btn icon-btn-sm">
                                <Pencil className="w-4 h-4" />
                            </span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar estudiante</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "delete",
            render: (item: StudentResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-destructive text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickDelete(item)}>
                            <Trash className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar estudiante</p>
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
