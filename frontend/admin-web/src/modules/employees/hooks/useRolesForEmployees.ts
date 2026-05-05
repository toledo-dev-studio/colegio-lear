import { useQuery } from "@tanstack/react-query";

import { GET_ROLES_FOR_EMPLOYEE_QUERY_KEY } from "../lib/queries-key";
import { getPagedRolesActionAsync } from "@/modules/roles/actions/get-paged-roles.action";

export const useRolesForEmployees = (query?: string) => {
    return useQuery({
        queryKey: [GET_ROLES_FOR_EMPLOYEE_QUERY_KEY, query],
        queryFn: () => getPagedRolesActionAsync({ query, page: 1, pageSize: 5, status: true }),
        enabled: !!query
    });
}
