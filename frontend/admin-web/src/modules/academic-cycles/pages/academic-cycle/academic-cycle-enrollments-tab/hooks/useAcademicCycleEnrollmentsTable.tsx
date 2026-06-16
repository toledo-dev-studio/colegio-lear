import { Link, useOutletContext } from "react-router";
import { Info, Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { ACADEMIC_CYCLE_SCHOOL_GROUP_ENROLLMENT_STATUSES, type AcademicCycleSchoolGroupEnrollment } from "@/interfaces/entites/academic-cycle-school-group-enrollment";

export const useAcademicCycleEnrollmentsTable = (
    onClickCreateUpdateEnrollment: (item: AcademicCycleSchoolGroupEnrollment) => void,
    handleDeleteEnrollment: (item: AcademicCycleSchoolGroupEnrollment) => void,
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
                scholarshipId ? (
                    <Link to={`/scholarships/${scholarshipId}`}>
                        <span className="text-primary">
                            {scholarship?.name ?? "-"}
                        </span>
                    </Link>
                ) : "-"
            )
        },
    ];

    // Table actions column with on click handler
    const actions: TableAction<AcademicCycleSchoolGroupEnrollment>[] = [
        {
            key: "info",
            render: (item: AcademicCycleSchoolGroupEnrollment) => (
                <Link to={`/students/${item.studentId}/academic-cycles/${item.academicCycleId}`}>
                    <Button variant={"info"} className="icon-btn-sm text-primary-foreground">
                        <Info className="w-4 h-4" />
                    </Button>
                </Link>
            )
        },
        {
            key: "edit",
            render: (item: AcademicCycleSchoolGroupEnrollment) => (
                <Button className="icon-btn-sm"
                    onClick={() => onClickCreateUpdateEnrollment(item)}>
                    <Pencil className="w-4 h-4" />
                </Button>
            )
        }];
    if (!isLocked) {
        actions.push(

            {
                key: "delete",
                render: (item: AcademicCycleSchoolGroupEnrollment) => (
                    <Button className="icon-btn-sm text-primary-foreground"
                        variant={"destructive"}
                        onClick={() => handleDeleteEnrollment(item)}>
                        <Trash className="w-4 h-4" />
                    </Button>
                )
            }
        );
    }

    return {
        columns,
        properties,
        actions
    }
}
