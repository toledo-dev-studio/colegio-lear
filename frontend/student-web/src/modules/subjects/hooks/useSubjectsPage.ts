// Hook principal de la página de Materias escolares: deriva las cards de las
// materias del alumno a partir de las consultas de maestros y de calendario

import { useAuthStore } from "@/stores/auth-store/auth.store";
import { selectedEnrollmentSelector, useActiveEnrollmentStore } from "@/stores/enrollment-store/enrollment.store";
import { useGetTeachersForAcademicCycleSchoolGroup } from "@/modules/dashboard/hooks/useGetTeachersForAcademicCycleSchoolGroup";
import { useGetCalendarsForAcademicCycleSchoolGroup } from "@/modules/calendar/hooks/useGetCalendarsForAcademicCycleSchoolGroup";
import { buildSchoolSubjectCards } from "../lib/subjects.lib";

export const useSubjectsPage = () => {
    // Main hooks and stores
    const { user } = useAuthStore();
    const enrollment = useActiveEnrollmentStore(selectedEnrollmentSelector);
    const academicCycle = enrollment?.academicCycle ?? null;

    // Queries
    const academicCycleId = academicCycle?.id ?? "";
    const academicCycleSchoolGroupId = enrollment?.academicCycleSchoolGroupId ?? "";

    const teachersQuery = useGetTeachersForAcademicCycleSchoolGroup({ academicCycleId, academicCycleSchoolGroupId });
    const calendarsQuery = useGetCalendarsForAcademicCycleSchoolGroup({ academicCycleId, academicCycleSchoolGroupId });

    const schoolSubjects = buildSchoolSubjectCards(teachersQuery.data ?? [], calendarsQuery.data ?? []);

    return {
        context: {
            student: user,
            enrollment,
            academicCycle
        },
        queries: {
            schoolSubjectsQuery: teachersQuery,
            calendarsQuery
        },
        schoolSubjects
    }
}
