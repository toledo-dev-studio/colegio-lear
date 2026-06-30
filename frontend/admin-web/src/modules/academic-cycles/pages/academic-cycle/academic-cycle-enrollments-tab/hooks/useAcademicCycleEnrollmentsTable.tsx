import { Link, useOutletContext } from "react-router";
import { Pencil, Trash } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import { ACADEMIC_CYCLE_ENROLLMENT_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";

interface Options {
    handleClickDelete: (item: AcademicCycleEnrollmentResponse) => void;
}

export const useAcademicCycleEnrollmentsTable = ({ handleClickDelete }: Options) => {
    // Get context from layout
    const { isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Table columns configuration structure
    const columns: string[] = [
        "Código de inscripción",
        "Estudiante",
        "Grupo escolar",
        "Estado de inscripción",
        "Beca asignada",
        "Acciones"
    ];

    // Table properties value configuration structure
    const properties: TableProperty<AcademicCycleEnrollmentResponse>[] = [
        {
            key: "code",
            render: ({ id, academicCycleId, code, student }: AcademicCycleEnrollmentResponse) => (
                <Link to={`/academic-cycles/${academicCycleId}/enrollments/${id}`}>
                    <span className="text-primary">
                        {code}
                    </span>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {student?.enrollment ?? ""}
                    </div>
                </Link>
            )
        },
        {
            key: "studentFullName",
            render: ({ studentId, student }: AcademicCycleEnrollmentResponse) => (
                <Link to={`/students/${studentId}`}>
                    <span className="text-primary">
                        {student?.enrollment}
                    </span>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {`${student?.name ?? ""} ${student?.firstLastName ?? ""} ${student?.secondLastName ?? ""}`}
                    </div>
                </Link>
            )
        },
        { key: "academicCycleSchoolGroup.name" },
        {
            key: "status",
            render: ({ status }: AcademicCycleEnrollmentResponse) => (
                <Badge variant={
                    status === "completed" ? "success" :
                        status === "enrolled" ? "default" : "destructive"} className="py-4 px-6">
                    {labelOf(ACADEMIC_CYCLE_ENROLLMENT_STATUSES, status)}
                </Badge>
            )
        },
        {
            key: "scholarship",
            render: ({ scholarship, scholarshipId }: AcademicCycleEnrollmentResponse) => (
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

    const actions: TableAction<AcademicCycleEnrollmentResponse>[] = [
        {
            key: "info",
            render: ({ id, academicCycleId }: AcademicCycleEnrollmentResponse) => (
                <Tooltip>
                    <TooltipTrigger>
                        <Link to={`/academic-cycles/${academicCycleId}/enrollments/${id}`}>
                            <span className="bg-primary text-white icon-btn icon-btn-sm">
                                <Pencil className="w-4 h-4" />
                            </span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Editar detalles de la inscripción</p>
                    </TooltipContent>
                </Tooltip>
            )
        }
    ];
    if (!isLocked) {
        actions.push(
            {
                key: "delete",
                render: (item: AcademicCycleEnrollmentResponse) => (
                    <Tooltip>
                        <TooltipTrigger>
                            <span className="bg-destructive text-white icon-btn icon-btn-sm"
                                onClick={() => handleClickDelete(item)}>
                                <Trash className="w-4 h-4" />
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Eliminar inscripción del alumno</p>
                        </TooltipContent>
                    </Tooltip>
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
