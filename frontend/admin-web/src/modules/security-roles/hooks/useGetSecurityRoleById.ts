import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import type { SecurityRoleResponse } from "@/interfaces/responses/security-role.response";
import { getSecurityRoleByIdAsync } from "../api/get-security-role-by-id.api";
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
            return getSecurityRoleByIdAsync({ id });
        },
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}
