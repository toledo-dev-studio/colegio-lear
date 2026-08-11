import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_ACADEMIC_CYCLE_ENROLLMENT_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { getAcademicCycleEnrollmentForStudentAsync } from "../api/get-academic-cycle-enrollment-for-student.api";

interface Options {
    studentId: string;
    academicCycleId: string;
}

export const useGetAcademicCycleEnrollmentForStudent = ({ studentId, academicCycleId }: Options) => {
    return useQuery({
        queryKey: [GET_ACADEMIC_CYCLE_ENROLLMENT_QUERY_KEY, { studentId, academicCycleId }],
        queryFn: () => getAcademicCycleEnrollmentForStudentAsync({ studentId, academicCycleId }),
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}
