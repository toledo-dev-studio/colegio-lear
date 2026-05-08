import { useQuery } from "@tanstack/react-query";

import { GET_SECURITY_ROLES_FOR_EMPLOYEE_QUERY_KEY } from "../lib/queries-key";
import { getPagedSecurityRolesActionAsync } from "@/modules/security-roles/actions/get-paged-security-roles.action";

export const useSecurityRolesForEmployees = (query?: string) => {
    return useQuery({
        queryKey: [GET_SECURITY_ROLES_FOR_EMPLOYEE_QUERY_KEY, query],
        queryFn: () => getPagedSecurityRolesActionAsync({ query, page: 1, pageSize: 5, status: true }),
        enabled: !!query
    });
}
