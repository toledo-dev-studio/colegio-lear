import { useAuthStore } from "@/stores/auth-store/auth.store";
import { selectedEnrollmentSelector, useActiveEnrollmentStore } from "@/stores/enrollment-store/enrollment.store";
import { useGetStudentGrades } from "@/modules/dashboard/hooks/useGetStudentGrades";

export const useStudentGradesPage = () => {
    // Main hooks and stores
    const { user } = useAuthStore();
    const enrollment = useActiveEnrollmentStore(selectedEnrollmentSelector);
    const academicCycle = enrollment?.academicCycle ?? null;

    // Queries
    const studentGradesQuery = useGetStudentGrades({ academicCycleId: academicCycle?.id!, academicCycleEnrollmentId: enrollment?.id! });

    return {
        context: {
            student: user,
            enrollment,
            academicCycle
        },
        queries: {
            studentGradesQuery
        }
    }
}
