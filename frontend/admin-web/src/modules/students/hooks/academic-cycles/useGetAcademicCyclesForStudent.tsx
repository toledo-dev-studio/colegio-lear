import { useQuery } from "@tanstack/react-query";

import { GET_ACADEMIC_CYCLES_FOR_STUDENT_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { getAcademicCyclesForStudentActionAsync } from "../../actions/academic-cycles/get-academic-cycles-for-student";

interface Options {
    studentId: string;
}

export const useGetAcademicCyclesForStudent = ({ studentId }: Options) => {
    const query = useQuery({
        queryKey: [GET_ACADEMIC_CYCLES_FOR_STUDENT_QUERY_KEY, { studentId: studentId }],
        queryFn: () => getAcademicCyclesForStudentActionAsync({ studentId }),
    });

    return {
        data: query.data ?? [],
        isLoading: query.isLoading,
        isError: query.isError,
        isFetching: query.isFetching
    }
}
