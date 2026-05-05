import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { stringToBooleanWithDefault } from "@/lib/utils";
import { GET_PAGED_EMPLOYEES_QUERY_KEY } from "../lib/queries-key";
import { getPagedEmployeesActionAsync } from "../actions/get-paged-employees.action";

export const usePagedEmployees = () => {

    const [searchParams] = useSearchParams();

    const query = searchParams.get('query')?.trim() || '';
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';
    const status = stringToBooleanWithDefault(searchParams.get('status'));
    const roleId = searchParams.get('role-id') || undefined;

    return useQuery({
        queryKey: [GET_PAGED_EMPLOYEES_QUERY_KEY, { query, status, roleId, page, pageSize }],
        queryFn: () => getPagedEmployeesActionAsync({
            query,
            status,
            roleId,
            page: isNaN(+page) ? 1 : Number(page),
            pageSize: isNaN(+pageSize) ? 1 : Number(pageSize),
        }),
    });
}