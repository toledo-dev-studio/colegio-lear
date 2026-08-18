import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteEmployeeByIdAsync } from "../../api/delete-employee-by-id.api";
import { GET_EMPLOYEE_QUERY_KEY, GET_PAGED_EMPLOYEES_QUERY_KEY } from "@/lib/queries-key/employees-queries-key";

export const useDeleteEmployeeById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteEmployeeByIdAsync,
        onSuccess: (id: string) => {
            // Remove query for single query
            queryClient.removeQueries({ queryKey: [GET_EMPLOYEE_QUERY_KEY, { id: id }] });

            // Invalid cache for useQueries, on invalid queries refetch is auto
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_EMPLOYEES_QUERY_KEY] });
        },
    });
}
