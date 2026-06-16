import { useOutletContext } from "react-router";

import type { StudentLayoutContext } from "@/modules/students/interfaces/student-layout-context";
import { useGetAcademicCyclesForStudent } from "@/modules/students/hooks/academic-cycles/useGetAcademicCyclesForStudent";

export const useStudentAcademicCyclesTab = () => {
    // Get context from layout
    const { studentId, student } = useOutletContext<StudentLayoutContext>();

    // Queries
    const academicCyclesForStudentQuery = useGetAcademicCyclesForStudent({ studentId });

    return {
        context: {
            student
        },
        queries: {
            academicCyclesForStudent: academicCyclesForStudentQuery
        },
    }
}
