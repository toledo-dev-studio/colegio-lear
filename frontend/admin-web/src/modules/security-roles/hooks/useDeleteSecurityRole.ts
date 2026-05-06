import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteSecurityRoleByIdActionAsync } from "../actions/delete-security-role-by-id.action";
import { GET_PAGED_SECURITY_ROLES_QUERY_KEY, GET_SECURITY_ROLES_QUERY_KEY } from "../lib/queries-key";

export const useDeleteSecurityRole = () => {

    const queryClient = useQueryClient();

    return {
        mutationDeleteSecurityRole: useMutation({
            mutationFn: deleteSecurityRoleByIdActionAsync,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [GET_SECURITY_ROLES_QUERY_KEY] });
                queryClient.invalidateQueries({ queryKey: [GET_PAGED_SECURITY_ROLES_QUERY_KEY] });

                queryClient.refetchQueries({ queryKey: [GET_PAGED_SECURITY_ROLES_QUERY_KEY] })
            },
        })
    }
}
