import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { stringToBooleanWithDefault } from "@/lib/utils";
import { GET_EMPLOYEES_QUERY_KEY } from "../lib/queries-key";
import { getEmployeesActionAsync } from "../actions/get-employees.action";

export const useExportEmployees = () => {

    const [searchParams] = useSearchParams();

    const query = searchParams.get('query')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));
    const roleId = searchParams.get('security-role-id') || undefined;
    const jobTitleId = searchParams.get('job-title-id') || undefined;

    return useQuery({
        queryKey: [GET_EMPLOYEES_QUERY_KEY, { query, status, roleId, jobTitleId }],
        queryFn: () => getEmployeesActionAsync({
            query,
            status,
            roleId,
            jobTitleId
        }),
        enabled: false,
    });
}
