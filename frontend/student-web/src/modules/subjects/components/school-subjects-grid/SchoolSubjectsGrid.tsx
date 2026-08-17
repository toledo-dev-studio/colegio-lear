// Grilla de materias escolares en cards, con estado vacío

import { Info } from "lucide-react";

import { SchoolSubjectCard } from "../school-subject-card/SchoolSubjectCard";
import type { SchoolSubjectCard as SchoolSubjectCardType } from "../../types/subjects.types";

interface Props {
    schoolSubjects: SchoolSubjectCardType[];
}

export const SchoolSubjectsGrid = ({ schoolSubjects }: Props) => {
    return (
        <section className="flex flex-col gap-y-6">

            {
                schoolSubjects.length === 0 && (
                    <section className="flex items-start gap-2 text-xs text-muted-foreground bg-amber-500/10 border border-amber-200/40 rounded-md px-4 py-3">
                        <Info className="w-4 h-4 shrink-0" />
                        <p>No se encontraron materias para este grupo en el ciclo escolar seleccionado.</p>
                    </section>
                )
            }

            {
                schoolSubjects.length > 0 && (
                    <section className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-5">
                        {schoolSubjects.map((subject) => (
                            <SchoolSubjectCard key={subject.schoolSubjectId} subject={subject} />
                        ))}
                    </section>
                )
            }

        </section>
    );
}
