import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteSecurityRoleByIdActionAsync } from "../actions/delete-security-role-by-id.action";
import { GET_PAGED_SECURITY_ROLES_QUERY_KEY, GET_SECURITY_ROLE_QUERY_KEY } from "@/lib/queries-key/security-roles-queries-key";

export const useDeleteSecurityRole = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteSecurityRoleByIdActionAsync,
        onSuccess: (id: string) => {
            // Remove query for single query
            queryClient.removeQueries({ queryKey: [GET_SECURITY_ROLE_QUERY_KEY, { id: id }] });

            // Invalid cache for useQueries, on invalid queries refetch is auto
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_SECURITY_ROLES_QUERY_KEY] });
        },
    });
}
