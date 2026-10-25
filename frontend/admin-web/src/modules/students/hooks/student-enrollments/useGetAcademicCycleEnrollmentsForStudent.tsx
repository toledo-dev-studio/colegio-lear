import { useQuery } from "@tanstack/react-query";

import { GET_ACADEMIC_CYCLES_FOR_STUDENT_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { getAcademicCycleEnrollmentsForStudentAsync } from "../../api/student-enrollments/get-academic-cycle-enrollments-for-student.api";

interface Options {
    studentId: string;
}

export const useGetAcademicCycleEnrollmentsForStudent = ({ studentId }: Options) => {
    const queryResult = useQuery({
        queryKey: [GET_ACADEMIC_CYCLES_FOR_STUDENT_QUERY_KEY, { studentId: studentId }],
        queryFn: () => getAcademicCycleEnrollmentsForStudentAsync({ studentId }),
    });

    return {
        ...queryResult,
        data: queryResult.data ?? [],
    }
}
