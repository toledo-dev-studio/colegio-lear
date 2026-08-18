import { Link } from "react-router";
import { GraduationCap } from "lucide-react";

import { Badge } from "@/shared/shadcn/ui/badge";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/shadcn/ui/tooltip";
import type { StudentResponse } from "@/interfaces/responses/student.response";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import { ACADEMIC_CYCLE_ENROLLMENT_STATUSES, ACADEMIC_CYCLE_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";

interface Options {
    student: StudentResponse
}

export const useStudentEnrollmentsTabTable = ({ student }: Options) => {
    // Table columns configuration structure
    const columns: string[] = [
        "Código de incripción",
        "Estado de inscripción",
        "Ciclo escolar",
        "Estado del ciclo escolar",
        "Grupo escolar",
        "Beca asignada",
        "Observaciones",
        "Acciones"
    ];

    // Table properties value configuration structure
    const properties: TableProperty<AcademicCycleEnrollmentResponse>[] = [
        {
            key: "enrollment",
            render: ({ id, academicCycleId, code }: AcademicCycleEnrollmentResponse) => (
                <Link to={`/academic-cycles/${academicCycleId}/enrollments/${id}`}>
                    <span className="text-primary">
                        {code}
                    </span>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {`${student?.name ?? ""} ${student?.firstLastName ?? ""} ${student?.secondLastName ?? ""}`}
                    </div>
                </Link>
            )
        },
        {
            key: "enrollmentStatus",
            render: ({ status }: AcademicCycleEnrollmentResponse) => (
                <Badge variant={
                    status === "completed" ? "success" :
                        status === "enrolled" ? "default" : "destructive"} className="py-4 px-6">
                    {labelOf(ACADEMIC_CYCLE_ENROLLMENT_STATUSES, status)}
                </Badge>
            )
        },
        {
            key: "academicCycle",
            render: ({ academicCycleId, academicCycle }: AcademicCycleEnrollmentResponse) => (
                <Link to={`/academic-cycles/${academicCycleId}`}>
                    <span className="text-primary">
                        {academicCycle?.name}
                    </span>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">{academicCycle?.code}</div>
                </Link>
            )
        },
        {
            key: "academicCycleStatus",
            render: ({ academicCycle }: AcademicCycleEnrollmentResponse) => (
                <Badge variant={
                    academicCycle?.status === "cancelled" ? "destructive" :
                        academicCycle?.status === "active" ? "success" :
                            academicCycle?.status === "completed" ? "outline" :
                                academicCycle?.status === "upcoming" ? "default" : "ghost"} className="py-4 px-6">
                    {labelOf(ACADEMIC_CYCLE_STATUSES, academicCycle?.status) || "-"}
                </Badge>
            )
        },
        { 
            key: "academicCycleSchoolGroup",
            render: ({ academicCycleId, academicCycleSchoolGroup, academicCycleSchoolGroupId }: AcademicCycleEnrollmentResponse) => (
                <Link to={`/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}`}>
                    <span className="text-primary">
                        {academicCycleSchoolGroup?.name}
                    </span>
                </Link>
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
        { key: "observations" }
    ];

    // Table actions column with on click handler
    const actions: TableAction<AcademicCycleEnrollmentResponse>[] = [
        {
            key: "details",
            render: ({ id, academicCycleId }: AcademicCycleEnrollmentResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <Link to={`/academic-cycles/${academicCycleId}/enrollments/${id}`}>
                            <span className="text-white icon-btn icon-btn-sm bg-success">
                                <GraduationCap className="w-4 h-4" />
                            </span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Seguimiento académico</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
    ];

    return {
        columns,
        properties,
        actions
    }
}
