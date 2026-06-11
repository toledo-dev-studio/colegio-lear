import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { stringToNumberWithDefault } from "@/lib/extensions/datatypes";
import { GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { getPagedEnrollmentsForAcademicCycleActionAsync } from "../../actions/enrollments/get-paged-enrollments-for-academic-cycle";

export const useGetPagedEnrollmentsForAcademicCycle = (academicCycleId: string, academicCycleSchoolGroupId: string) => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get("query")?.trim() || undefined;
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("page-size"), 5);

    return useQuery({
        queryKey: [GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY, { query, page, pageSize, academicCycleId, academicCycleSchoolGroupId }],
        queryFn: () => getPagedEnrollmentsForAcademicCycleActionAsync({ query, page, pageSize, academicCycleId, academicCycleSchoolGroupId }),
        enabled: false
    });
}
