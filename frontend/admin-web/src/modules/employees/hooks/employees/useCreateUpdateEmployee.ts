import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createUpdateEmployeeActionAsync } from "../../actions/create-update-employee.action";
import { GET_EMPLOYEE_QUERY_KEY, GET_PAGED_EMPLOYEES_QUERY_KEY } from "@/lib/queries-key/employees-queries-key";

export const useCreateUpdateEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateEmployeeActionAsync,
        onSuccess: (response) => {
            // Invalid cache for useQueries
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_EMPLOYEES_QUERY_KEY] });

            // Set data to query data for created/updated record
            queryClient.setQueryData([GET_EMPLOYEE_QUERY_KEY, { id: response.id }], response);
        }
    });
}
