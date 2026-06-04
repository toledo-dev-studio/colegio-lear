import { Link, useOutletContext } from "react-router";

import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { AcademicCycleSchoolSubject } from "@/interfaces/entites/academic-cycle-school-subject";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { Button } from "@/shared/ui/button";
import { Pencil, Trash } from "lucide-react";

export const useAcademicCycleSchoolSubjecTable = (handleEdit: (item: AcademicCycleSchoolSubject) => void, handleDelete: (item: AcademicCycleSchoolSubject) => void) => {
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
    const properties: TableProperty<AcademicCycleSchoolSubject>[] = [
        {
            key: "schoolSubject.name",
            render: (item: AcademicCycleSchoolSubject) => (
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

    const actions: TableAction<AcademicCycleSchoolSubject>[] = isLocked ? [] : [
        {
            key: "edit",
            render: (item: AcademicCycleSchoolSubject) => (
                <Button
                    aria-label="Editar"
                    className="icon-btn-sm bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={() => handleEdit(item)}>
                    <Pencil className="w-4 h-4" />
                </Button>
            )
        },
        {
            key: "delete",
            render: (item: AcademicCycleSchoolSubject) => (
                <Button
                    aria-label="Eliminar"
                    className="icon-btn-sm bg-destructive text-primary-foreground hover:bg-destructive/90"
                    onClick={() => handleDelete(item)}>
                    <Trash className="w-4 h-4" />
                </Button>
            )
        }
    ];

    return {
        columns,
        properties,
        actions
    }
}
