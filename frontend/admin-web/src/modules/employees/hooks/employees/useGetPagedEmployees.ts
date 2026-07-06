import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_PAGED_EMPLOYEES_QUERY_KEY } from "@/lib/queries-key/employees-queries-key";
import { getPagedEmployeesActionAsync } from "../../actions/get-paged-employees.action";
import { isValidBooleanString, isValidValueWithDefault, stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useGetPagedEmployees = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);
    const page = stringToNumberWithDefault(searchParams.get("page"), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get("page-size"), 10);

    // Advanced query filters
    const fullName = isValidValueWithDefault(searchParams.get("full-name")?.trim(), undefined)
    const isActive = isValidBooleanString(searchParams.get("is-active")) ? stringToBooleanWithDefault(searchParams.get("is-active")) : undefined;
    const securityRoleId = isValidValueWithDefault(searchParams.get("security-role-id"), undefined);
    const jobTitleId = isValidValueWithDefault(searchParams.get("job-title-id"), undefined);

    const queryResult = useQuery({
        queryKey: [GET_PAGED_EMPLOYEES_QUERY_KEY, { query, page, pageSize, fullName, isActive, securityRoleId, jobTitleId, }],
        queryFn: () => getPagedEmployeesActionAsync({
            query,
            page,
            pageSize,
            fullName,
            isActive,
            securityRoleId,
            jobTitleId,
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