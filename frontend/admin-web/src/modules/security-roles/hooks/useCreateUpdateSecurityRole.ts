import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { SecurityRoleResponse } from "@/interfaces/responses/security-role.response";
import { createUpdateSecurityRoleAsync } from "../api/create-update-security-role.api";
import { GET_PAGED_SECURITY_ROLES_QUERY_KEY, GET_SECURITY_ROLE_QUERY_KEY } from "@/lib/queries-key/security-roles-queries-key";

export const useCreateUpdateSecurityRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateSecurityRoleAsync,
        onSuccess: (response: SecurityRoleResponse) => {
            // Invalid cache for useQueries
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_SECURITY_ROLES_QUERY_KEY] });

            // Set data to query data for created/updated record
            queryClient.setQueryData([GET_SECURITY_ROLE_QUERY_KEY, { id: response.id }], response);
        },
    });
}
