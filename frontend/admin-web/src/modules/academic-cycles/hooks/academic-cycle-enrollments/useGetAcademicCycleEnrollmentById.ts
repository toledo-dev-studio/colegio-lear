import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_ACADEMIC_CYCLE_ENROLLMENT_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { getAcademicCycleEnrollmentByIdAsync } from "../../api/academic-cycle-enrollments/get-academic-cycle-enrollment-by-id.api";

interface Options {
    id: string;
    academicCycleId: string;
}

export const useGetAcademicCycleEnrollmentById = ({ id, academicCycleId }: Options) => {
    return useQuery({
        queryKey: [GET_ACADEMIC_CYCLE_ENROLLMENT_QUERY_KEY, { id }],
        queryFn: () => getAcademicCycleEnrollmentByIdAsync({ id, academicCycleId }),
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}
