import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { getPagedMyClassesAsync } from "../api/get-paged-my-classes.api";
import { GET_PAGED_MY_CLASSES_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";
import type { AcademicCycleStatusKey, AcademicCycleSchoolGroupStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";
import { isValidValueWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useGetPagedMyClasses = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("page-size"), 10);

    // Advanced query filters
    const name = isValidValueWithDefault(searchParams.get("name")?.trim(), undefined);
    const status = isValidValueWithDefault(searchParams.get("status")?.trim() as AcademicCycleSchoolGroupStatusKey, undefined);
    const academicCycleStatus = isValidValueWithDefault(searchParams.get("academic-cycle-status")?.trim() as AcademicCycleStatusKey, undefined);

    const queryResult = useQuery({
        queryKey: [GET_PAGED_MY_CLASSES_QUERY_KEY, { query, page, pageSize, name, status, academicCycleStatus }],
        queryFn: () => getPagedMyClassesAsync({
            query,
            page,
            pageSize,
            name,
            status,
            academicCycleStatus,
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