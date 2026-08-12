// Lógica pura para construir las cards de materias escolares a partir del
// endpoint de maestros (materia + docente) y del Calendar del grupo (horario)

import type { DayOfWeekKey } from "@/lib/key-value-pairs/key-value-pair-types";
import type { AcademicCycleSchoolGroupTeacherResponse } from "@/interfaces/responses/academic-cycle-school-group-teacher.response";
import type { AcademicCycleSchoolGroupCalendarResponse } from "@/interfaces/responses/academic-cycle-school-group-calendar.response";
import type { SchoolSubjectCard, SchoolSubjectScheduleItem } from "../types/subjects.types";

/** Orden natural de los días de la semana (lunes primero) */
const DAY_ORDER: Record<DayOfWeekKey, number> = {
    monday: 0,
    tuesday: 1,
    wednesday: 2,
    thursday: 3,
    friday: 4,
    saturday: 5,
    sunday: 6,
};

/** Normaliza un horario "HH:mm[:ss]" a "HH:mm" */
const toHHmm = (value: string): string => value.slice(0, 5);

/**
 * Cruza las materias/docentes (pares únicos derivados del Calendar en backend)
 * con los registros del Calendar para armar el resumen de horario semanal de
 * cada materia, y devuelve las cards ordenadas alfabéticamente por nombre.
 */
export const buildSchoolSubjectCards = (
    teachers: AcademicCycleSchoolGroupTeacherResponse[],
    calendars: AcademicCycleSchoolGroupCalendarResponse[],
): SchoolSubjectCard[] => {
    const scheduleBySubjectId = new Map<string, SchoolSubjectScheduleItem[]>();

    for (const item of calendars) {
        if (!item.schoolSubjectId) continue;

        const schedule = scheduleBySubjectId.get(item.schoolSubjectId) ?? [];
        schedule.push({
            day: item.day,
            startTime: toHHmm(item.startTime),
            endTime: toHHmm(item.endTime),
        });
        scheduleBySubjectId.set(item.schoolSubjectId, schedule);
    }

    for (const schedule of scheduleBySubjectId.values()) {
        schedule.sort(
            (a, b) => DAY_ORDER[a.day] - DAY_ORDER[b.day] || a.startTime.localeCompare(b.startTime),
        );
    }

    return teachers
        .map((pair): SchoolSubjectCard => ({
            schoolSubjectId: pair.schoolSubjectId,
            schoolSubject: pair.schoolSubject,
            teacherId: pair.teacherId,
            teacher: pair.teacher,
            schedule: scheduleBySubjectId.get(pair.schoolSubjectId) ?? [],
        }))
        .sort((a, b) => a.schoolSubject.name.localeCompare(b.schoolSubject.name, "es"));
};
