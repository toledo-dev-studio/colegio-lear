import { Link } from "react-router";
import { Info, Wallet } from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import type { Student } from "@/interfaces/entites/student";
import { ACADEMIC_CYCLE_STATUSES } from "@/interfaces/entites/academic-cycle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import type { TableAction } from "@/shared/components/table/interfaces/table-action";
import type { TableProperty } from "@/shared/components/table/interfaces/table-property";
import { ACADEMIC_CYCLE_SCHOOL_GROUP_ENROLLMENT_STATUSES, type AcademicCycleSchoolGroupEnrollment } from "@/interfaces/entites/academic-cycle-school-group-enrollment";

interface Options {
    student: Student
}

export const useStudentAcademicCyclesTable = ({ student }: Options) => {
    // Table columns configuration structure
    const columns: string[] = [
        "Estudiante",
        "Ciclo escolar",
        "Estado de inscripción",
        "Estado de ciclo escolar",
        "Beca asignada",
        "Observaciones",
        "Acciones"
    ];

    // Table properties value configuration structure
    const properties: TableProperty<AcademicCycleSchoolGroupEnrollment>[] = [
        {
            key: "student.name",
            render: () => (
                <Link to={`/students/${student.id}`}>
                    <span className="text-primary">
                        {student.enrollment}
                    </span>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">
                        {`${student.name} ${student.firstLastName} ${student.secondLastName}`}
                    </div>
                </Link>
            )
        },
        {
            key: "academicCycle.name",
            render: (item: AcademicCycleSchoolGroupEnrollment) => (
                <Link to={`/academic-cycles/${item.academicCycleId}`}>
                    <span className="text-primary">
                        {item.academicCycle?.name}
                    </span>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">{item.academicCycle?.code}</div>
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
            key: "academicCycle.status",
            render: (item: AcademicCycleSchoolGroupEnrollment) => (
                <Badge variant={
                    item.academicCycle?.status === "cancelled" ? "destructive" :
                        item.academicCycle?.status === "active" ? "success" :
                            item.academicCycle?.status === "completed" ? "outline" :
                                item.academicCycle?.status === "upcoming" ? "default" : "ghost"
                } className="py-4 px-6">
                    {ACADEMIC_CYCLE_STATUSES.find((status) => status.key === item.academicCycle?.status)?.label || "Desconocido"}
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
        {
            key: "observations"
        }
    ];

    // Table actions column with on click handler
    const actions: TableAction<AcademicCycleSchoolGroupEnrollment>[] = [
        {
            key: "info",
            render: (item: AcademicCycleSchoolGroupEnrollment) => (
                <Tooltip>
                    <TooltipTrigger>
                        <Link to={`/students/${item.studentId}/enrollments/${item.academicCycleSchoolGroupId}`}>
                            <Button variant={"info"} className="icon-btn-sm text-primary-foreground">
                                <Info className="w-4 h-4" />
                            </Button>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Consultar detalles de la inscripción</p>
                    </TooltipContent>
                </Tooltip>
            )
        },
        {
            key: "payments",
            render: (item: AcademicCycleSchoolGroupEnrollment) => item.academicCycle?.status === "active" &&
                (
                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant={"success"} className="icon-btn-sm">
                                <Wallet className="w-4 h-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Registrar nuevo pago</p>
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
