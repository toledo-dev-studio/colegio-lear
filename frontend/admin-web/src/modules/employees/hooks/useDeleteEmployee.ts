import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteEmployeeByIdActionAsync } from "../actions/delete-employee-by-id.action";
import { GET_EMPLOYEES_QUERY_KEY, GET_PAGED_EMPLOYEES_QUERY_KEY } from "../lib/queries-key";

export const useDeleteEmployee = () => {

    const queryClient = useQueryClient();

    return {
        mutationDeleteEmployee: useMutation({
            mutationFn: deleteEmployeeByIdActionAsync,
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEES_QUERY_KEY] });
                queryClient.invalidateQueries({ queryKey: [GET_PAGED_EMPLOYEES_QUERY_KEY] });

                queryClient.refetchQueries({ queryKey: [GET_PAGED_EMPLOYEES_QUERY_KEY] })
            },
        })
    }
}
