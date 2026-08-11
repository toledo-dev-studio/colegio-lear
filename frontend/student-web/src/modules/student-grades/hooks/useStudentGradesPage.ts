import { useAuthStore } from "@/stores/auth-store/auth.store";
import { selectedAcademicCycleSelector, useActiveCycleStore } from "@/stores/academic-cycle-store/academic-cycle.store";
import { useGetAcademicCycleEnrollmentForStudent } from "@/modules/dashboard/hooks/useGetAcademicCycleEnrollmentForStudent";
import { useGetStudentGrades } from "@/modules/dashboard/hooks/useGetStudentGrades";

export const useStudentGradesPage = () => {
    // Main hooks and stores
    const { user } = useAuthStore();
    const selectedAcademicCycle = useActiveCycleStore(selectedAcademicCycleSelector);

    // Queries
    const enrollmentQuery = useGetAcademicCycleEnrollmentForStudent({ studentId: user?.id!, academicCycleId: selectedAcademicCycle?.id! });
    const studentGradesQuery = useGetStudentGrades({ academicCycleId: selectedAcademicCycle?.id!, academicCycleEnrollmentId: enrollmentQuery.data?.id! });

    return {
        context: {
            student: user,
            academicCycle: selectedAcademicCycle
        },
        queries: {
            enrollmentQuery,
            studentGradesQuery
        }
    }
}
