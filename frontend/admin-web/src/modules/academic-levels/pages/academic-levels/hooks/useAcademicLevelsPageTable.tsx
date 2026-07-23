import { Link } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { AcademicLevelResponse } from "@/interfaces/responses/academic-level.response";

interface Options {
    handleClickDelete: (item: AcademicLevelResponse) => void;
}

export const useAcademicLevelsPageTable = ({ handleClickDelete }: Options) => {
    // Check permissions
    const canDelete = usePermission("academic-levels", "can-delete");

    // Table columns configuration structure
    const columns: string[] = [
        "Nombre",
        "Descripción",
        "¿Registro activo?",
        "Acciones",
    ];

    // Table properties value configuration structure
    const properties: TableProperty<AcademicLevelResponse>[] = [
        {
            key: "name",
            render: ({ id, name }: AcademicLevelResponse) => (
                <Link to={`/academic-levels/${id}`}>
                    <span className="text-primary">
                        {name}
                    </span>
                </Link>
            )
        },
        {
            key: "description"
        },
        {
            key: "isActive",
            render: ({ isActive }: AcademicLevelResponse) => (
                <Badge variant={isActive ? "success" : "destructive"} className="py-4 px-6">
                    {
                        isActive ? "Activo" : "Inactivo"
                    }
                </Badge>
            )
        }
    ];

    // Table actions list
    const actions: TableAction<AcademicLevelResponse>[] = [
        {
            key: "edit",
            render: ({ id }: AcademicLevelResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <Link to={`/academic-levels/${id}`}>
                            <span className="bg-primary text-white icon-btn icon-btn-sm">
                                <Pencil className="w-4 h-4" />
                            </span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar nivel académico</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "delete",
            render: (item: AcademicLevelResponse) => (
                canDelete &&
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-destructive text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickDelete(item)}>
                            <Trash className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar nivel académico</p>
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
