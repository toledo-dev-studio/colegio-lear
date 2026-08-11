import { useAuthStore } from "@/stores/auth-store/auth.store";
import { useGetChats } from "./useGetChats";
import { selectedAcademicCycleSelector, useActiveCycleStore } from "@/stores/academic-cycle-store/academic-cycle.store";
import { useGetAcademicCycleEnrollmentForStudent } from "@/modules/dashboard/hooks/useGetAcademicCycleEnrollmentForStudent";

export const useChatsPage = () => {
    // Main hooks and stores
    const { user } = useAuthStore();
    const selectedAcademicCycle = useActiveCycleStore(selectedAcademicCycleSelector);

    // Queries
    const enrollmentQuery = useGetAcademicCycleEnrollmentForStudent({ studentId: user?.id!, academicCycleId: selectedAcademicCycle?.id! });
    const chatsQuery = useGetChats({ studentId: user?.id!, enrollmentId: enrollmentQuery.data?.id! });

    return {
        context: {
            student: user,
            academicCycle: selectedAcademicCycle
        },
        queries: {
            enrollmentQuery,
            chatsQuery
        }
    }
}