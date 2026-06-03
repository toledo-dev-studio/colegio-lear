import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { GET_PAGED_ACADEMIC_CYCLES_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { isValidBooleanString, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";
import { getPagedAcademicCyclesActionAsync } from "@/modules/academic-cycles/actions/academic-cycles/get-paged-academic-cycles.action";
import type { AcademicCycleStatusKey, AcademicPeriodTypeKey } from "@/types/KeyValuePair";

export const useGetPagedAcademicCycles = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get("query")?.trim() || undefined;
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("page-size"), 10);

    // Advanced query filters
    const name = searchParams.get("name")?.trim() || undefined;
    const code = searchParams.get("code")?.trim() || undefined;
    const startDate = searchParams.get("start-date")?.trim() || undefined;
    const endDate = searchParams.get("end-date")?.trim() || undefined;
    const type = searchParams.get("type")?.trim() as AcademicPeriodTypeKey || undefined;
    const enrollmentOpen = isValidBooleanString(searchParams.get("enrollment-open")) ? stringToBooleanWithDefault(searchParams.get("enrollment-open")) : undefined;
    const status = searchParams.get("status") as AcademicCycleStatusKey || undefined;

    const queryResult = useQuery({
        queryKey: [GET_PAGED_ACADEMIC_CYCLES_QUERY_KEY, { query, page, pageSize, name, code, startDate, endDate, type, enrollmentOpen, status }],
        queryFn: () => getPagedAcademicCyclesActionAsync({
            query,
            page,
            pageSize,
            name,
            code,
            startDate,
            endDate,
            type,
            enrollmentOpen,
            status,
        }),
    });

    return {
        ...queryResult,
        data: queryResult.data?.data ?? [],
        totalPages: queryResult.data?.totalPages ?? 0,
        currentPage: queryResult.data?.currentPage ?? 0,
        itemsCount: queryResult.data?.itemsCount ?? 0
    }
}
