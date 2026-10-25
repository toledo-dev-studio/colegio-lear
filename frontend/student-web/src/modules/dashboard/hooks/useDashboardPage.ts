import { useAuthStore } from "@/stores/auth-store/auth.store";
import { selectedEnrollmentSelector, useActiveEnrollmentStore } from "@/stores/enrollment-store/enrollment.store";
import { useGetStudentWallet } from "./useGetStudentWallet";
import { useGetStudentGrades } from "./useGetStudentGrades";

export const useDashboardPage = () => {
    // Main hooks and stores
    const { user } = useAuthStore();
    const enrollment = useActiveEnrollmentStore(selectedEnrollmentSelector);
    const academicCycle = enrollment?.academicCycle ?? null;

    // Queries
    const walletQuery = useGetStudentWallet({ academicCycleId: academicCycle?.id!, academicCycleEnrollmentId: enrollment?.id! });
    const studentGradesQuery = useGetStudentGrades({ academicCycleId: academicCycle?.id!, academicCycleEnrollmentId: enrollment?.id! });

    return {
        context: {
            student: user,
            enrollment,
            academicCycle
        },
        queries: {
            walletQuery,
            studentGradesQuery
        }
    }
}
