import { cn } from "@/lib/extensions/utils";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";
import { StudentAvatar } from "./StudentAvatar";

interface Props {
    enrollments: AcademicCycleEnrollmentResponse[];
    selectedEnrollmentId?: string;
    onSelectEnrollment: (enrollmentId: string) => void;
}

const getStudentFullName = (enrollment: AcademicCycleEnrollmentResponse): string => {
    const student = enrollment.student;
    if (!student) return "Estudiante";
    return `${student.name} ${student.firstLastName}${student.secondLastName ? ` ${student.secondLastName}` : ""}`;
};

const getStudentEnrollmentNumber = (enrollment: AcademicCycleEnrollmentResponse): string => {
    return enrollment.student?.enrollment ?? enrollment.code;
};

export const StudentsList = ({ enrollments, selectedEnrollmentId, onSelectEnrollment }: Props) => {
    return (
        <section className="flex flex-col divide-y divide-border">
            {enrollments.map((enrollment) => {
                const isSelected = enrollment.id === selectedEnrollmentId;
                const student = enrollment.student;

                return (
                    <button
                        key={enrollment.id}
                        type="button"
                        onClick={() => onSelectEnrollment(enrollment.id)}
                        className={cn(
                            "flex items-center gap-3 w-full text-left px-4 py-3 transition-colors hover:bg-muted/40 cursor-pointer",
                            isSelected && "bg-muted/60 hover:bg-muted/60"
                        )}
                    >
                        {student && <StudentAvatar student={student} />}

                        <section className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground truncate">
                                {getStudentFullName(enrollment)}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-0.5">
                                Matrícula {getStudentEnrollmentNumber(enrollment)}
                            </p>
                        </section>
                    </button>
                );
            })}
        </section>
    );
}