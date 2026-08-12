// Card de una materia escolar: nombre, descripción, docente y horario semanal

import { BookOpen, Clock } from "lucide-react";

import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { DAY_OF_WEEKS } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import { TeacherAvatar } from "@/shared/components/teacher-avatar/TeacherAvatar";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";
import type { SchoolSubjectCard as SchoolSubjectCardType } from "../../types/subjects.types";

const getTeacherFullName = (teacher: EmployeeResponse): string =>
    `${teacher.name} ${teacher.firstLastName}${teacher.secondLastName ? ` ${teacher.secondLastName}` : ""}`;

interface Props {
    subject: SchoolSubjectCardType;
}

export const SchoolSubjectCard = ({ subject }: Props) => {
    const { schoolSubject, teacher, schedule } = subject;

    return (
        <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:p-6 shadow-sm transition-colors hover:bg-muted/40">
            <header className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-foreground text-sm min-w-0 truncate">{schoolSubject.name}</h3>
            </header>

            <p className="text-sm text-muted-foreground flex-1">
                {schoolSubject.description || "Sin descripción disponible."}
            </p>

            <footer className="flex flex-col gap-3 pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                    <TeacherAvatar teacher={teacher} className="w-9 h-9" />
                    <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Docente</p>
                        <p className="text-sm font-medium text-foreground truncate">{getTeacherFullName(teacher)}</p>
                    </div>
                </div>

                {
                    schedule.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Horario semanal
                            </p>
                            <ul className="flex flex-wrap gap-1.5">
                                {schedule.map((item, index) => (
                                    <li key={index} className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                                        {labelOf(DAY_OF_WEEKS, item.day)} {item.startTime}–{item.endTime}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
                }
            </footer>
        </article>
    );
}
