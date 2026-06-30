import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_ACADEMIC_CYCLE_ENROLLMENT_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";
import { getAcademicCycleEnrollmentByIdActionAsync } from "../../actions/academic-cycle-enrollments/get-academic-cycle-enrollment-by-id.action";

interface Options {
    id: string;
    academicCycleSchoolGroupId: string;
    academicCycleId: string;
}

export const useGetAcademicCycleEnrollmentById = ({ id, academicCycleSchoolGroupId, academicCycleId }: Options) => {
    return useQuery({
        queryKey: [GET_ACADEMIC_CYCLE_ENROLLMENT_QUERY_KEY, { id }],
        queryFn: () => {
            if (id === "new") {
                return {} as unknown as AcademicCycleEnrollmentResponse;
            }
            return getAcademicCycleEnrollmentByIdActionAsync({ id, academicCycleSchoolGroupId, academicCycleId })
        },
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}
