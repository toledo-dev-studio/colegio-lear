import { useQuery } from "@tanstack/react-query";

import { GET_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { getEnrollmentsForAcademicCycleActionAsync } from "../../actions/enrollments/get-enrollments-for-academic-cycle";

export const useGetEnrollmentsForAcademicCycle = (academicCycleId: string, academicCycleSchoolGroupId: string) => {
    return useQuery({
        queryKey: [GET_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY, { academicCycleId: academicCycleId, academicCycleSchoolGroupId: academicCycleSchoolGroupId }],
        queryFn: () => getEnrollmentsForAcademicCycleActionAsync({ academicCycleId, academicCycleSchoolGroupId }),
        enabled: false
    });
}
