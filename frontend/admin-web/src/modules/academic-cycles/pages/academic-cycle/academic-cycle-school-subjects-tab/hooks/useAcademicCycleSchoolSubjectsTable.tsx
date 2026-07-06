import { Link, useOutletContext } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import type { AcademicCycleSchoolSubjectResponse } from "@/interfaces/responses/academic-cycle-school-subject.response";

interface Options {
    handleClickEdit: (item: AcademicCycleSchoolSubjectResponse) => void;
    handleClickDelete: (item: AcademicCycleSchoolSubjectResponse) => void;
}

export const useAcademicCycleSchoolSubjectsTable = ({ handleClickEdit, handleClickDelete }: Options) => {
    // Get context from layout
    const { isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Table columns configuration structure
    const columns: string[] = [
        "Materia escolar",
        "Descripción de la materia",
        "Observaciones adicionales",
        "Acciones"
    ];
    isLocked && columns.pop();

    // Table properties value configuration structure
    const properties: TableProperty<AcademicCycleSchoolSubjectResponse>[] = [
        {
            key: "schoolSubject.name",
            render: (item: AcademicCycleSchoolSubjectResponse) => (
                <Link to={`/school-subjects/${item.schoolSubjectId}`}>
                    <span className="text-primary">
                        {item.schoolSubject?.name ?? "-"}
                    </span>
                </Link>
            )
        },
        { key: "schoolSubject.description" },
        { key: "observations" }
    ];

    const actions: TableAction<AcademicCycleSchoolSubjectResponse>[] = isLocked ? [] : [
        {
            key: "edit",
            render: (item: AcademicCycleSchoolSubjectResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-primary text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickEdit(item)}>
                            <Pencil className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar materia escolar</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "delete",
            render: (item: AcademicCycleSchoolSubjectResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <span className="bg-destructive text-white icon-btn icon-btn-sm"
                            onClick={() => handleClickDelete(item)}>
                            <Trash className="w-4 h-4" />
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Eliminar materia escolar</p>
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
