import { useAuthStore } from "@/stores/auth-store/auth.store";
import { useGetStudentWalletPayments } from "./useGetStudentWalletPayments";
import { useGetStudentWallet } from "@/modules/dashboard/hooks/useGetStudentWallet";
import { selectedAcademicCycleSelector, useActiveCycleStore } from "@/stores/academic-cycle-store/academic-cycle.store";
import { useGetAcademicCycleEnrollmentForStudent } from "@/modules/dashboard/hooks/useGetAcademicCycleEnrollmentForStudent";

export const useStudentWalletPage = () => {
    // Main hooks and stores
    const { user } = useAuthStore();
    const selectedAcademicCycle = useActiveCycleStore(selectedAcademicCycleSelector);

    // Queries
    const enrollmentQuery = useGetAcademicCycleEnrollmentForStudent({ studentId: user?.id!, academicCycleId: selectedAcademicCycle?.id! });
    const walletQuery = useGetStudentWallet({ academicCycleId: selectedAcademicCycle?.id!, academicCycleEnrollmentId: enrollmentQuery.data?.id! });
    const walletPaymentsQuery = useGetStudentWalletPayments({ academicCycleId: selectedAcademicCycle?.id!, academicCycleEnrollmentId: enrollmentQuery.data?.id! });

    return {
        context: {
            student: user,
            academicCycle: selectedAcademicCycle
        },
        queries: {
            enrollmentQuery,
            walletQuery,
            walletPaymentsQuery
        }
    }
}
