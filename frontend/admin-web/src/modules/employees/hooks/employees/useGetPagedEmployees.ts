import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { getPagedEmployeesActionAsync } from "../../actions/get-paged-employees.action";
import { GET_PAGED_EMPLOYEES_QUERY_KEY } from "../../../../lib/queries-key/employees-queries-key";
import { stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useGetPagedEmployees = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';
    const page = stringToNumberWithDefault(searchParams.get('page'), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get('pageSize'), 10);

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));
    const roleId = searchParams.get('security-role-id') || undefined;
    const jobTitleId = searchParams.get('job-title-id') || undefined;

    const queryResult = useQuery({
        queryKey: [GET_PAGED_EMPLOYEES_QUERY_KEY, { query, page, pageSize, name, status, roleId, jobTitleId, }],
        queryFn: () => getPagedEmployeesActionAsync({
            query,
            page,
            pageSize,
            name,
            status,
            roleId,
            jobTitleId,
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