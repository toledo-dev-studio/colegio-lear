import { useQuery } from "@tanstack/react-query";

import { SINGLE_RECORD_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { getSecurityRoleByIdActionAsync } from "../actions/get-security-role-by-id.action";
import { GET_SECURITY_ROLE_QUERY_KEY } from "@/lib/queries-key/security-roles-queries-key";

export const useGetByIdSecurityRole = (id?: string, enabledQuery: boolean = true, staleTime = SINGLE_RECORD_STALE_TIME) => {
    return useQuery({
        queryKey: [GET_SECURITY_ROLE_QUERY_KEY, { id }],
        queryFn: () => getSecurityRoleByIdActionAsync(id),
        retry: false,
        staleTime: staleTime,
        enabled: enabledQuery
    });
}
