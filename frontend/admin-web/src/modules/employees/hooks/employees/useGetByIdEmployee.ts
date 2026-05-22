import { useQuery } from "@tanstack/react-query";

import { GET_EMPLOYEE_QUERY_KEY } from "@/lib/queries-key/employees-queries-key";
import { getEmployeeByIdActionAsync } from "../../actions/get-employee-by-id.action";

export const useGetByIdEmployee = (id: string) => {
    return useQuery({
        queryKey: [GET_EMPLOYEE_QUERY_KEY, { id }],
        queryFn: () => getEmployeeByIdActionAsync(id),
        retry: false,
        staleTime: 0,
    });

}
