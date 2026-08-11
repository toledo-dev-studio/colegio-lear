import { useAuthStore } from "@/stores/auth-store/auth.store";
import { useGetAcademicCycleEnrollmentForStudent } from "./useGetAcademicCycleEnrollmentForStudent";
import { selectedAcademicCycleSelector, useActiveCycleStore } from "@/stores/academic-cycle-store/academic-cycle.store";
import { useGetStudentWallet } from "./useGetStudentWallet";
import { useGetStudentGrades } from "./useGetStudentGrades";

export const useDashboardPage = () => {
    // Main hooks and stores
    const { user } = useAuthStore();
    const selectedAcademicCycle = useActiveCycleStore(selectedAcademicCycleSelector);

    // Queries
    const enrollmentQuery = useGetAcademicCycleEnrollmentForStudent({ studentId: user?.id!, academicCycleId: selectedAcademicCycle?.id! });
    const walletQuery = useGetStudentWallet({ academicCycleId: selectedAcademicCycle?.id!, academicCycleEnrollmentId: enrollmentQuery.data?.id! });
    const studentGradesQuery = useGetStudentGrades({ academicCycleId: selectedAcademicCycle?.id!, academicCycleEnrollmentId: enrollmentQuery.data?.id! });

    return {
        context: {
            student: user,
            academicCycle: selectedAcademicCycle
        },
        queries: {
            enrollmentQuery,
            walletQuery,
            studentGradesQuery
        }
    }
}
