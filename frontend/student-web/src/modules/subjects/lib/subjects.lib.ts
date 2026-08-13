// Lógica pura para construir las cards de materias escolares a partir del
// endpoint de maestros (materia + docente) y del Calendar del grupo (horario),
// así como los estados de las tareas según su fecha de entrega

import type { DayOfWeekKey } from "@/lib/key-value-pairs/key-value-pair-types";
import type { KeyValuePair } from "@/lib/key-value-pairs/key-value-pair";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { formatFriendlyDate } from "@/lib/extensions/formatters";
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
            academicCycleSchoolSubjectId: pair.academicCycleSchoolSubjectId,
            schoolSubjectId: pair.schoolSubjectId,
            schoolSubject: pair.schoolSubject,
            teacherId: pair.teacherId,
            teacher: pair.teacher,
            schedule: scheduleBySubjectId.get(pair.schoolSubjectId) ?? [],
        }))
        .sort((a, b) => a.schoolSubject.name.localeCompare(b.schoolSubject.name, "es"));
};

/**
 * Estado de una tarea según la cercanía de su fecha de entrega con respecto a
 * la fecha actual: "upcoming" (a más de 5 días), "near" (5 días o menos) y
 * "overdue" (la fecha de entrega ya pasó).
 */
export type TaskDueDateStatusKey = "upcoming" | "near" | "overdue";

/** Ventana en días para considerar una tarea como próxima a vencer */
export const TASKS_DUE_DATE_NEAR_WINDOW_DAYS = 5;

export const TASK_DUE_DATE_STATUSES: KeyValuePair<TaskDueDateStatusKey>[] = [
    { key: "upcoming", label: "Próxima" },
    { key: "near", label: "Por entregar" },
    { key: "overdue", label: "Vencida" },
];

export const labelOfTaskDueDateStatus = (status: TaskDueDateStatusKey): string =>
    labelOf(TASK_DUE_DATE_STATUSES, status);

const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * Calcula el estado de una tarea a partir de su fecha de entrega (ISO string).
 * La comparación se hace a nivel de día, ignorando la hora del día.
 */
export const getTaskDueDateStatus = (dueDate: string, now: Date = new Date()): TaskDueDateStatusKey => {
    const dueDay = startOfDay(new Date(dueDate)).getTime();
    const todayDay = startOfDay(now).getTime();
    const daysUntilDue = Math.round((dueDay - todayDay) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) return "overdue";
    if (daysUntilDue <= TASKS_DUE_DATE_NEAR_WINDOW_DAYS) return "near";
    return "upcoming";
};

/** Formatea la fecha de entrega en un formato legible en español */
export const formatTaskDueDate = (dueDate: string): string => formatFriendlyDate(dueDate);
