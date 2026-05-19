import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getEmployeesActionAsync } from "../../actions/get-employees.action";

export const useExportEmployees = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';

    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));
    const roleId = searchParams.get('security-role-id') || undefined;
    const jobTitleId = searchParams.get('job-title-id') || undefined;

    return useMutation({
        mutationFn: () => getEmployeesActionAsync({
            query,
            name,
            status,
            roleId,
            jobTitleId
        }),
    });
}
