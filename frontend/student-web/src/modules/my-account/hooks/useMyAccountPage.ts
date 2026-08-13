import { useAuthStore } from "@/stores/auth-store/auth.store";
import { useGetStudentAccount } from "./useGetStudentAccount";
import { useGetStudentGuardians } from "./useGetStudentGuardians";
import { useGetStudentAllergies } from "./useGetStudentAllergies";
import { selectedEnrollmentSelector, useActiveEnrollmentStore } from "@/stores/enrollment-store/enrollment.store";

// Hook principal de la página Mi Cuenta, compone stores y consultas

export const useMyAccountPage = () => {
    // Main hooks and stores
    const { user } = useAuthStore();
    const enrollment = useActiveEnrollmentStore(selectedEnrollmentSelector);
    const academicCycle = enrollment?.academicCycle ?? null;

    // Queries
    const accountQuery = useGetStudentAccount();
    const guardiansQuery = useGetStudentGuardians();
    const allergiesQuery = useGetStudentAllergies();

    return {
        context: {
            student: user,
            enrollment,
            academicCycle
        },
        queries: {
            accountQuery,
            guardiansQuery,
            allergiesQuery
        }
    }
}