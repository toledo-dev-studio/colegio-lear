import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { SecurityRole } from "@/interfaces/entites/security-role";
import { getSecurityRoleByIdActionAsync } from "../actions/get-security-role-by-id.action";
import { CreateUpdateSecurityRoleActionAsync } from "../actions/create-update-security-role.action";
import { GET_PAGED_SECURITY_ROLES_QUERY_KEY, GET_SECURITY_ROLE_QUERY_KEY, GET_SECURITY_ROLES_QUERY_KEY } from "../lib/queries-key";

export const useSecurityRole = (id?: string, enabledQuery: boolean = true) => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [GET_SECURITY_ROLE_QUERY_KEY, { id }],
        queryFn: () => getSecurityRoleByIdActionAsync(id),
        retry: false,
        staleTime: 0,
        enabled: enabledQuery
    });

    const mutation = useMutation({
        mutationFn: CreateUpdateSecurityRoleActionAsync,
        onSuccess: (response: SecurityRole) => {
            // Invalidar cache de useQuery de consulta
            queryClient.invalidateQueries({ queryKey: [GET_SECURITY_ROLES_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_SECURITY_ROLES_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_SECURITY_ROLE_QUERY_KEY, { id: response.id }] });

            // Actualizar query data
            queryClient.setQueryData([GET_SECURITY_ROLE_QUERY_KEY, { id: response.id }], response);
        },
    });

    return {
        ...query,
        mutation,
    }
}
