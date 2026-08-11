import { useAuthStore } from "@/stores/auth-store/auth.store";
import { selectedAcademicCycleSelector, useActiveCycleStore } from "@/stores/academic-cycle-store/academic-cycle.store";
import { useGetAcademicCycleEnrollmentForStudent } from "@/modules/dashboard/hooks/useGetAcademicCycleEnrollmentForStudent";
import { useGetCalendarsForAcademicCycleSchoolGroup } from "./useGetCalendarsForAcademicCycleSchoolGroup";

export const useCalendarPage = () => {
    // Main hooks and stores
    const { user } = useAuthStore();
    const selectedAcademicCycle = useActiveCycleStore(selectedAcademicCycleSelector);

    // Queries
    const enrollmentQuery = useGetAcademicCycleEnrollmentForStudent({ studentId: user?.id!, academicCycleId: selectedAcademicCycle?.id! });
    const calendarsQuery = useGetCalendarsForAcademicCycleSchoolGroup({ academicCycleId: selectedAcademicCycle?.id!, academicCycleSchoolGroupId: enrollmentQuery.data?.academicCycleSchoolGroupId! });

    return {
        context: {
            student: user,
            academicCycle: selectedAcademicCycle
        },
        queries: {
            enrollmentQuery,
            calendarsQuery
        }
    }
}
