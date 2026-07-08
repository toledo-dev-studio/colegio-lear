import { useQuery } from "@tanstack/react-query";

import { GET_ACADEMIC_CYCLES_FOR_STUDENT_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { getAcademicCycleEnrollmentsForStudentActionAsync } from "../../actions/student-enrollments/get-academic-cycle-enrollments-for-student.action";

interface Options {
    studentId: string;
}

export const useGetAcademicCycleEnrollmentsForStudent = ({ studentId }: Options) => {
    const queryResult = useQuery({
        queryKey: [GET_ACADEMIC_CYCLES_FOR_STUDENT_QUERY_KEY, { studentId: studentId }],
        queryFn: () => getAcademicCycleEnrollmentsForStudentActionAsync({ studentId }),
    });

    return {
        ...queryResult,
        data: queryResult.data ?? [],
    }
}
