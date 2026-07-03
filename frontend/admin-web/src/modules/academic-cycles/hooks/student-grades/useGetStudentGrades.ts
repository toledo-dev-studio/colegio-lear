import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_STUDENT_GRADES_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { getStudentGradesActionAsync } from "../../actions/student-grades/get-student-grades.action";

interface Options {
    academicCycleId: string;
    academicCycleEnrollmentId: string;
}

export const useGetStudentGrades = ({ academicCycleId, academicCycleEnrollmentId }: Options) => {
    const queryResult = useQuery({
        queryKey: [GET_STUDENT_GRADES_QUERY_KEY, { academicCycleId, academicCycleEnrollmentId }],
        queryFn: () => getStudentGradesActionAsync({ academicCycleId, academicCycleEnrollmentId }),
        staleTime: FIVE_MINUTES_STALE_TIME
    });

    return {
        ...queryResult,
        data: queryResult.data ?? []
    }
}
