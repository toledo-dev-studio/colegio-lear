import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_PAGED_ACADEMIC_CYCLES_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import type { AcademicCycleStatusKey, AcademicPeriodTypeKey } from "@/lib/key-value-pairs/key-value-pair";
import { getPagedAcademicCyclesActionAsync } from "@/modules/academic-cycles/actions/academic-cycles/get-paged-academic-cycles.action";
import { isValidBooleanString, isValidValueWithDefault, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useGetPagedAcademicCycles = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("page-size"), 10);

    // Advanced query filters
    const name = isValidValueWithDefault(searchParams.get("name")?.trim(), undefined);
    const code = isValidValueWithDefault(searchParams.get("code")?.trim(), undefined);
    const startDate = isValidValueWithDefault(searchParams.get("start-date")?.trim(), undefined);
    const endDate = isValidValueWithDefault(searchParams.get("end-date")?.trim(), undefined);
    const periodType = isValidValueWithDefault(searchParams.get("period-type")?.trim() as AcademicPeriodTypeKey, undefined);
    const status = isValidValueWithDefault(searchParams.get("status")?.trim() as AcademicCycleStatusKey, undefined);
    const enrollmentOpen = isValidBooleanString(searchParams.get("enrollment-open")) ? stringToBooleanWithDefault(searchParams.get("enrollmentOpen")) : undefined;
    const academicLevelId = isValidValueWithDefault(searchParams.get("academic-level-id")?.trim(), undefined);
    const educationLevelId = isValidValueWithDefault(searchParams.get("education-level-id")?.trim(), undefined);


    const queryResult = useQuery({
        queryKey: [GET_PAGED_ACADEMIC_CYCLES_QUERY_KEY, {
            query,
            page,
            pageSize,
            name,
            code,
            startDate,
            endDate,
            periodType,
            enrollmentOpen,
            status,
            academicLevelId,
            educationLevelId
        }],
        queryFn: () => getPagedAcademicCyclesActionAsync({
            query,
            page,
            pageSize,
            name,
            code,
            startDate,
            endDate,
            periodType,
            enrollmentOpen,
            status,
            academicLevelId,
            educationLevelId
        }),
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
