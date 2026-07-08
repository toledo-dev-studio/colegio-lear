import { useOutletContext } from "react-router";

import type { StudentLayoutContext } from "@/modules/students/interfaces/student-layout-context";
import { useGetAcademicCycleEnrollmentsForStudent } from "@/modules/students/hooks/student-enrollments/useGetAcademicCycleEnrollmentsForStudent";

export const useStudentEnrollmentsTab = () => {
    // Get context from layout
    const { studentId, student } = useOutletContext<StudentLayoutContext>();

    // Queries
    const getAcademicCycleEnrollmentsForStudentQuery = useGetAcademicCycleEnrollmentsForStudent({ studentId });

    return {
        context: {
            student
        },
        queries: {
            enrollments: {
                get: getAcademicCycleEnrollmentsForStudentQuery
            }
        },
    }
}
