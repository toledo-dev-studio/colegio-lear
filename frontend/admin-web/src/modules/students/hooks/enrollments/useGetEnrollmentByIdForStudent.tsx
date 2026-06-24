import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { getEnrollmentByIdForStudentActionAsync } from "../../actions/enrollments/get-enrollment-by-id-for-student";
import { GET_ENROLLMENT_FOR_STUDENT_QUERY_KEY } from "@/lib/queries-key/students-queries-key";

interface Options {
    studentId: string;
    academicCycleSchoolGroupEnrollmentId: string;
}

export const useGetEnrollmentByIdForStudent = ({ studentId, academicCycleSchoolGroupEnrollmentId }: Options) => {
    return useQuery({
        queryKey: [GET_ENROLLMENT_FOR_STUDENT_QUERY_KEY, { studentId, academicCycleSchoolGroupEnrollmentId }],
        queryFn: () => getEnrollmentByIdForStudentActionAsync({ studentId, academicCycleSchoolGroupEnrollmentId }),
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}
