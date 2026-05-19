import { useQuery } from "@tanstack/react-query";

import { SINGLE_RECORD_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_EMPLOYEE_QUERY_KEY } from "@/lib/queries-key/employees-queries-key";
import { getEmployeeByIdActionAsync } from "../../actions/get-employee-by-id.action";

export const useGetByIdEmployee = (id: string, enabledQuery: boolean = true, staleTime = SINGLE_RECORD_STALE_TIME) => {
    return useQuery({
        queryKey: [GET_EMPLOYEE_QUERY_KEY, { id }],
        queryFn: () => getEmployeeByIdActionAsync(id),
        retry: false,
        staleTime: staleTime,
        enabled: enabledQuery
    });

}
