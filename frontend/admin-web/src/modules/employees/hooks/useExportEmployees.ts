import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { stringToBooleanWithDefault } from "@/lib/utils";
import { GET_EMPLOYEES_QUERY_KEY } from "../lib/queries-key";
import { getEmployeesActionAsync } from "../actions/get-employees.action";

export const useExportEmployees = () => {

    const [searchParams] = useSearchParams();

    const query = searchParams.get('query')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));
    const roleId = searchParams.get('role-id') || undefined;

    return useQuery({
        queryKey: [GET_EMPLOYEES_QUERY_KEY, { query, status }],
        queryFn: () => getEmployeesActionAsync({
            query,
            status,
            roleId
        }),
        enabled: false,
    });
}
