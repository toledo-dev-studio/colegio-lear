import { useAuthStore } from "@/stores/auth-store/auth.store";
import { useGetChats } from "./useGetChats";
import { selectedEnrollmentSelector, useActiveEnrollmentStore } from "@/stores/enrollment-store/enrollment.store";

export const useChatsPage = () => {
    // Main hooks and stores
    const { user } = useAuthStore();
    const enrollment = useActiveEnrollmentStore(selectedEnrollmentSelector);
    const academicCycle = enrollment?.academicCycle ?? null;

    // Queries
    const chatsQuery = useGetChats({ studentId: user?.id!, enrollmentId: enrollment?.id! });

    return {
        context: {
            student: user,
            enrollment,
            academicCycle
        },
        queries: {
            chatsQuery
        }
    }
}
