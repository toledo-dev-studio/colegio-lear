import { useQuery } from "@tanstack/react-query";

import type { SecurityRoleResponse } from "@/interfaces/responses/security-role.response";
import { getSecurityRoleByIdActionAsync } from "../actions/get-security-role-by-id.action";
import { GET_SECURITY_ROLE_QUERY_KEY } from "@/lib/queries-key/security-roles-queries-key";

interface Options {
    id: string;
}

export const useGetSecurityRoleById = ({ id }: Options) => {
    return useQuery({
        queryKey: [GET_SECURITY_ROLE_QUERY_KEY, { id }],
        queryFn: () => {
            if (id === "new") {
                return { } as unknown as SecurityRoleResponse;
            }
            return getSecurityRoleByIdActionAsync({ id });
        },
        retry: false,
        staleTime: 0,
    });
}
