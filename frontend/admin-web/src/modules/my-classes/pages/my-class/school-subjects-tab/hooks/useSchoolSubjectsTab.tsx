import { useMemo } from "react";

import type { DayOfWeekKey } from "@/lib/key-value-pairs/key-value-pair-types";
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { useGetCalendarsForAcademicCycleSchoolGroup } from "@/modules/academic-cycles/hooks/academic-cycle-school-groups/useGetCalendarsForAcademicCycleSchoolGroup";
import type { SchoolSubjectSchedule } from "../interfaces/school-subject-schedule";

const DAY_ORDER: Record<DayOfWeekKey, number> = {
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
    sunday: 7
};

interface Options {
    academicCycleId?: string;
    schoolGroupId?: string;
}

export const useSchoolSubjectsTab = ({ academicCycleId, schoolGroupId }: Options) => {
    // Component hooks & stores
    const { user } = useAuthStore();
    const calendarsQuery = useGetCalendarsForAcademicCycleSchoolGroup({
        academicCycleId: academicCycleId!,
        academicCycleSchoolGroupId: schoolGroupId!,
    });

    // School subjects assigned to the logged-in user, grouped from the school group calendar
    const schoolSubjects = useMemo<SchoolSubjectSchedule[]>(() => {
        const calendars = (calendarsQuery.data ?? []).filter(calendar => calendar.teacherId === user?.id);

        const grouped = new Map<string, SchoolSubjectSchedule>();

        for (const calendar of calendars) {
            const entry = grouped.get(calendar.schoolSubjectId) ?? {
                schoolSubjectId: calendar.schoolSubjectId,
                name: calendar.schoolSubject?.name ?? "Sin nombre",
                sessions: [],
            };

            entry.sessions.push({
                day: calendar.day,
                startTime: calendar.startTime,
                endTime: calendar.endTime,
            });

            grouped.set(calendar.schoolSubjectId, entry);
        }

        return [...grouped.values()].map(subject => ({
            ...subject,
            sessions: subject.sessions.sort(
                (a, b) => DAY_ORDER[a.day] - DAY_ORDER[b.day] || a.startTime.localeCompare(b.startTime)
            ),
        }));
    }, [calendarsQuery.data, user?.id]);

    return {
        schoolSubjects,
        isLoading: calendarsQuery.isLoading,
        isError: calendarsQuery.isError,
    };
}

export type SchoolSubjectsTabReturn = ReturnType<typeof useSchoolSubjectsTab>;