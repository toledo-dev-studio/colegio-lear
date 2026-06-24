import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { stringToNumberWithDefault } from "@/lib/extensions/datatypes";
import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { getPagedEnrollmentsForAcademicCycleActionAsync } from "../../actions/enrollments/get-paged-enrollments-for-academic-cycle";
import type { AcademicCycleSchoolGroupEnrollmentStatusKey } from "@/lib/key-value-pairs/key-value-pair";

interface Options {
    academicCycleId?: string;
}

export const useGetPagedEnrollmentsForAcademicCycle = ({ academicCycleId }: Options) => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get("query")?.trim() || undefined;
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("page-size"), 10);
    const academicCycleSchoolGroupId = searchParams.get("school-group-id")?.trim() || undefined;
    const academicCycleSchoolGroupEnrollmentStatus = searchParams.get("status")?.trim() as AcademicCycleSchoolGroupEnrollmentStatusKey || undefined;

    return useQuery({
        queryKey: [GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY, { query, page, pageSize, academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolGroupEnrollmentStatus }],
        queryFn: () => getPagedEnrollmentsForAcademicCycleActionAsync({ query, page, pageSize, academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolGroupEnrollmentStatus }),
        enabled: (!!academicCycleId && !!academicCycleSchoolGroupId),
        staleTime: FIVE_MINUTES_STALE_TIME
    });
}
