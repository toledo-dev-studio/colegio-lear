import { useAuthStore } from "@/stores/auth-store/auth.store";
import { useGetStudentAssists } from "./useGetStudentAssists";
import { selectedEnrollmentSelector, useActiveEnrollmentStore } from "@/stores/enrollment-store/enrollment.store";

export const useAttendancePage = () => {
    // Main hooks and stores
    const { user } = useAuthStore();
    const enrollment = useActiveEnrollmentStore(selectedEnrollmentSelector);
    const academicCycle = enrollment?.academicCycle ?? null;

    // Queries
    const assistsQuery = useGetStudentAssists({ academicCycleId: academicCycle?.id!, academicCycleEnrollmentId: enrollment?.id! });

    return {
        context: {
            student: user,
            enrollment,
            academicCycle
        },
        queries: {
            assistsQuery
        },
    }
}
