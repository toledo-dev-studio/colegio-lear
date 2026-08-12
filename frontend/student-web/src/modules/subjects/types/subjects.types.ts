// Tipos locales del módulo Materias escolares: vista combinada de materia, docente y horario

import type { DayOfWeekKey } from "@/lib/key-value-pairs/key-value-pair-types";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";

/**
 * Bloque de clase de una materia en un día de la semana.
 * Los horarios se normalizan al formato "HH:mm".
 */
export interface SchoolSubjectScheduleItem {
    day: DayOfWeekKey;
    startTime: string;
    endTime: string;
}

/**
 * Card de materia escolar que se imparte al alumno: la materia, el docente que
 * la imparte y el resumen de horario semanal derivado del Calendar del grupo.
 */
export interface SchoolSubjectCard {
    schoolSubjectId: string;
    schoolSubject: SchoolSubjectResponse;
    teacherId: string;
    teacher: EmployeeResponse;
    schedule: SchoolSubjectScheduleItem[];
}
