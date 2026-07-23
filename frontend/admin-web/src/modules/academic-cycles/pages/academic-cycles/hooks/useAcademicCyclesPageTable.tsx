import { Link } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { formatFriendlyDate } from "@/lib/extensions/formatters";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";
import { ACADEMIC_CYCLE_PERIOD_TYPES, ACADEMIC_CYCLE_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";

interface Options {
    handleClickDelete: (item: AcademicCycleResponse) => void;
}

export const useAcademicCyclesPageTable = ({ handleClickDelete }: Options) => {
    // Check permissions
    const canDelete = usePermission("academic-cycles", "can-delete");

    // Table columns configuration structure
    const columns: string[] = [
        "Nombre & código",
        "Fecha de inicio",
        "Fecha de termino",
        "¿Inscripciones abiertas?",
        "Estatus del ciclo escolar",
        "Tipo de ciclo escolar",
        "Acciones"
    ];

    // Table properties value configuration structure
    const properties: TableProperty<AcademicCycleResponse>[] = [
        {
            key: "name",
            render: ({ id, name, code }: AcademicCycleResponse) => (
                <Link to={`/academic-cycles/${id}`}>
                    <span className="text-primary">
                        {name}
                    </span>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">{code}</div>
                </Link>
            )
        },
        {
            key: "startDate",
            render: ({ startDate }: AcademicCycleResponse) => (<>{formatFriendlyDate(startDate)}</>)
        },
        {
            key: "endDate",
            render: ({ endDate }: AcademicCycleResponse) => (<>{formatFriendlyDate(endDate)}</>)
        },
        {
            key: "enrollmentOpen",
            render: ({ enrollmentOpen }: AcademicCycleResponse) => (
                <Badge variant={enrollmentOpen ? "default" : "destructive"} className="py-4 px-6">
                    {
                        enrollmentOpen ? "Abiertas" : "Cerradas"
                    }
                </Badge>
            )
        },
        {
            key: "status",
            render: ({ status }: AcademicCycleResponse) => (
                <Badge variant={
                    status === "cancelled" ? "destructive" :
                        status === "active" ? "success" :
                            status === "completed" ? "outline" :
                                status === "upcoming" ? "default" : "ghost"} className="py-4 px-6">
                    {labelOf(ACADEMIC_CYCLE_STATUSES, status)}
                </Badge>
            )
        },
        {
            key: "periodType",
            render: ({ periodType }: AcademicCycleResponse) => (
                <span className="text-nowrap min-w-fit rounded-full bg-gray-400/20 px-4 py-2 text-xs font-medium text-gray-500 inset-ring inset-ring-gray-400/40 dark:text-gray-300">
                    {labelOf(ACADEMIC_CYCLE_PERIOD_TYPES, periodType) || "Desconocido"}
                </span>
            )
        }
    ];

    // Table actions list
    const actions: TableAction<AcademicCycleResponse>[] = [
        {
            key: "edit",
            render: ({ id }: AcademicCycleResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <Link to={`/academic-cycles/${id}`}>
                            <span className="bg-primary text-white icon-btn icon-btn-sm">
                                <Pencil className="w-4 h-4" />
                            </span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar ciclo escolar</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "delete",
            render: (item: AcademicCycleResponse) => (
                canDelete &&
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-destructive text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickDelete(item)}>
                            <Trash className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar ciclo escolar</p>
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
