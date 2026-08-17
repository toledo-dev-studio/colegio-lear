import { useAuthStore } from "@/stores/auth-store/auth.store";
import { useGetStudentWalletPayments } from "./useGetStudentWalletPayments";
import { useGetStudentWallet } from "@/modules/dashboard/hooks/useGetStudentWallet";
import { selectedEnrollmentSelector, useActiveEnrollmentStore } from "@/stores/enrollment-store/enrollment.store";

export const useStudentWalletPage = () => {
    // Main hooks and stores
    const { user } = useAuthStore();
    const enrollment = useActiveEnrollmentStore(selectedEnrollmentSelector);
    const academicCycle = enrollment?.academicCycle ?? null;

    // Queries
    const walletQuery = useGetStudentWallet({ academicCycleId: academicCycle?.id!, academicCycleEnrollmentId: enrollment?.id! });
    const walletPaymentsQuery = useGetStudentWalletPayments({ academicCycleId: academicCycle?.id!, academicCycleEnrollmentId: enrollment?.id! });

    return {
        context: {
            student: user,
            enrollment,
            academicCycle
        },
        queries: {
            walletQuery,
            walletPaymentsQuery
        }
    }
}
