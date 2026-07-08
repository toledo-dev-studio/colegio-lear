import { Link, useOutletContext } from "react-router";
import { Calendar, Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import { ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { AcademicCycleSchoolGroupResponse } from "@/interfaces/responses/academic-cycle-school-group.response";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";

interface Options {
    handleClickEdit: (item: AcademicCycleSchoolGroupResponse) => void;
    handleClickDelete: (item: AcademicCycleSchoolGroupResponse) => void;
}

export const useAcademicCycleSchoolGroupsTable = ({ handleClickEdit, handleClickDelete }: Options) => {
    // Get context from layout
    const { academicCycleId, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Table columns configuration structure
    const columns: string[] = [
        "Grupo escolar",
        "Descripción",
        "Estatus",
        "Acciones"
    ];

    // Table properties value configuration structure
    const properties: TableProperty<AcademicCycleSchoolGroupResponse>[] = [
        {
            key: "name",
            render: ({ id, name }: AcademicCycleSchoolGroupResponse) => (
                <Link to={`/academic-cycles/${academicCycleId}/school-groups/${id}`}>
                    <span className="text-primary">
                        {name}
                    </span>
                </Link>
            )
        },
        { key: "description" },
        {
            key: "status",
            render: ({ status }: AcademicCycleSchoolGroupResponse) => (
                <Badge variant={
                    status === "discharged" ? "destructive" :
                        status === "active" ? "success" : "ghost"
                } className="py-4 px-6">
                    {labelOf(ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES, status) || "Desconocido"}
                </Badge>
            )
        },
    ];

    // Table actions column with on click handler
    const actions: TableAction<AcademicCycleSchoolGroupResponse>[] = isLocked ?
        [{
            key: "calendar",
            render: (item: AcademicCycleSchoolGroupResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-primary text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickEdit(item)}>
                            <Calendar className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Consultar horario escolar</p>
                    </TooltipContent>
                </Tooltip>
            )
        }]
        :
        [
            {
                key: "edit",
                render: (item: AcademicCycleSchoolGroupResponse) => (
                    <Tooltip>
                        <TooltipTrigger>
                            <span className="bg-primary text-white icon-btn icon-btn-sm"
                                onClick={() => handleClickEdit(item)}>
                                <Pencil className="w-4 h-4" />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Editar grupo escolar</p>
                        </TooltipContent>
                    </Tooltip>
                )
            },
            {
                key: "delete",
                render: (item: AcademicCycleSchoolGroupResponse) => (
                    <Tooltip>
                        <TooltipTrigger>
                            <span className="bg-destructive text-white icon-btn icon-btn-sm"
                                onClick={() => handleClickDelete(item)}>
                                <Trash className="w-4 h-4" />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Eliminar grupo escolar</p>
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
