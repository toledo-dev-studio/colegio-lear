import { Link, useOutletContext } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { ACADEMIC_CYCLE_SCHOOL_GROUP_ENROLLMENT_STATUSES, type AcademicCycleSchoolGroupEnrollment } from "@/interfaces/entites/academic-cycle-school-group-enrollment";

export const useAcademicCycleEnrollmentsTable = (
    handleEdit: (item: AcademicCycleSchoolGroupEnrollment) => void,
    handleDelete: (item: AcademicCycleSchoolGroupEnrollment) => void,
) => {
    // Get context from layout
    const { isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Table columns configuration structure
    const columns: string[] = [
        "Estudiante",
        "Estado de inscripción",
        "Beca asignada",
        "Acciones"
    ];
    isLocked && columns.pop();

    // Table properties value configuration structure
    const properties: TableProperty<AcademicCycleSchoolGroupEnrollment>[] = [
        {
            key: "student.name",
            render: (item: AcademicCycleSchoolGroupEnrollment) => (
                <Link to={`/students/${item.studentId}`}>
                    <span className="text-primary">
                        {item.student?.enrollment}
                    </span>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {`${item.student?.name ?? ""} ${item.student?.firstLastName ?? ""} ${item.student?.secondLastName ?? ""}`}
                    </div>
                </Link>
            )
        },
        {
            key: "status",
            render: ({ status }) => (
                <Badge variant={
                    status === "completed" ? "success" :
                        status === "enrolled" ? "default" : "destructive"} className="py-4 px-6">
                    {ACADEMIC_CYCLE_SCHOOL_GROUP_ENROLLMENT_STATUSES.find(item => item.key === status)?.label}
                </Badge>
            )
        },
        {
            key: "scholarship",
            render: ({ scholarship, scholarshipId }) => (
                <Link to={`/scholarships/${scholarshipId}`}>
                    <span className="text-primary">
                        {scholarship?.name ?? "-"}
                    </span>
                </Link>
            )
        },
    ];

    // Table actions column with on click handler
    const actions: TableAction<AcademicCycleSchoolGroupEnrollment>[] = isLocked ? [] : [
        {
            key: "payment",
            render: (item: AcademicCycleSchoolGroupEnrollment) => (
                <Button
                    aria-label="Registrar pago"
                    className="icon-btn-sm bg-success text-primary-foreground hover:bg-success/90"
                    onClick={() => handleEdit(item)}>
                    <Pencil className="w-4 h-4" />
                </Button>
            )
        },
        {
            key: "edit",
            render: (item: AcademicCycleSchoolGroupEnrollment) => (
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
            render: (item: AcademicCycleSchoolGroupEnrollment) => (
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
