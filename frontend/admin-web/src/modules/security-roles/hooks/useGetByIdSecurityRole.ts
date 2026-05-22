import { useQuery } from "@tanstack/react-query";

import { getSecurityRoleByIdActionAsync } from "../actions/get-security-role-by-id.action";
import { GET_SECURITY_ROLE_QUERY_KEY } from "@/lib/queries-key/security-roles-queries-key";

export const useGetByIdSecurityRole = (id?: string) => {
    return useQuery({
        queryKey: [GET_SECURITY_ROLE_QUERY_KEY, { id }],
        queryFn: () => getSecurityRoleByIdActionAsync(id),
        retry: false,
        staleTime: 0,
    });
}
