import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_EMPLOYEE_QUERY_KEY } from "@/lib/queries-key/employees-queries-key";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";
import { getEmployeeByIdAsync } from "../../api/get-employee-by-id.api";

interface Options {
    id: string;
}

export const useGetEmployeeById = ({ id }: Options) => {
    return useQuery({
        queryKey: [GET_EMPLOYEE_QUERY_KEY, { id }],
        queryFn: () => {
            if (id === "new") {
                return {} as unknown as EmployeeResponse;
            }
            return getEmployeeByIdAsync({ id })
        },
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });

}
