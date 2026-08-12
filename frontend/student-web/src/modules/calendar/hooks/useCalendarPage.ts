import { useAuthStore } from "@/stores/auth-store/auth.store";
import { selectedEnrollmentSelector, useActiveEnrollmentStore } from "@/stores/enrollment-store/enrollment.store";
import { useGetCalendarsForAcademicCycleSchoolGroup } from "./useGetCalendarsForAcademicCycleSchoolGroup";

export const useCalendarPage = () => {
    // Main hooks and stores
    const { user } = useAuthStore();
    const enrollment = useActiveEnrollmentStore(selectedEnrollmentSelector);
    const academicCycle = enrollment?.academicCycle ?? null;

    // Queries
    const calendarsQuery = useGetCalendarsForAcademicCycleSchoolGroup({ academicCycleId: academicCycle?.id!, academicCycleSchoolGroupId: enrollment?.academicCycleSchoolGroupId! });

    return {
        context: {
            student: user,
            enrollment,
            academicCycle
        },
        queries: {
            calendarsQuery
        }
    }
}
