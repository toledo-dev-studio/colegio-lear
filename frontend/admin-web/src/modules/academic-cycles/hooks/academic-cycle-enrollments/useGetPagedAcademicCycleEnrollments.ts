import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { isValidValueWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";
import type { AcademicCycleEnrollmentStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";
import { GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { getPagedAcademicCycleEnrollmentsAsync } from "../../api/academic-cycle-enrollments/get-paged-academic-cycle-enrollments.api";

interface Options {
    academicCycleId: string;
}

export const useGetPagedAcademicCycleEnrollments = ({ academicCycleId }: Options) => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("page-size"), 10);

    // Advanced query filters
    const scholarshipId = isValidValueWithDefault(searchParams.get("scholarship-id")?.trim(), undefined);
    const academicCycleSchoolGroupId = isValidValueWithDefault(searchParams.get("school-group-id")?.trim(), undefined);
    const status = isValidValueWithDefault(searchParams.get("status")?.trim() as AcademicCycleEnrollmentStatusKey, undefined);

    const queryResult = useQuery({
        queryKey: [GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY, {
            query,
            page,
            pageSize,
            academicCycleId,
            scholarshipId,
            academicCycleSchoolGroupId,
            status
        }],
        queryFn: () => getPagedAcademicCycleEnrollmentsAsync({
            query,
            page,
            pageSize,
            academicCycleId,
            scholarshipId,
            academicCycleSchoolGroupId,
            status
        }),
        enabled: (!!academicCycleId),
        staleTime: FIVE_MINUTES_STALE_TIME
    });

    return {
        ...queryResult,
        data: queryResult.data?.data ?? [],
        totalPages: queryResult.data?.totalPages ?? 0,
        currentPage: queryResult.data?.currentPage ?? 0,
        itemsCount: queryResult.data?.itemsCount ?? 0
    }
}
