import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getEmployeeByIdActionAsync } from "../actions/get-employee-by-id.action";
import { CreateUpdateEmployeeActionAsync } from "../actions/create-update-employee.action";
import { GET_EMPLOYEE_QUERY_KEY, GET_EMPLOYEES_QUERY_KEY, GET_PAGED_EMPLOYEES_QUERY_KEY } from "../lib/queries-key";

export const useEmployee = (id: string) => {

    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [GET_EMPLOYEE_QUERY_KEY, { id }],
        queryFn: () => getEmployeeByIdActionAsync(id),
        retry: false,
        staleTime: 0
    });

    const mutation = useMutation({
        mutationFn: CreateUpdateEmployeeActionAsync,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEES_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_EMPLOYEES_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_EMPLOYEE_QUERY_KEY] });

            queryClient.setQueryData([GET_EMPLOYEE_QUERY_KEY, data.id], data);
        }
    });

    return {
        ...query,
        mutation
    };
}
