import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { getEmployeesActionAsync } from "../../actions/get-employees.action";
import { isValidBooleanString, isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";

export const useGetEmployees = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);

    // Advanced query filters
    const fullName = isValidValueWithDefault(searchParams.get("full-name")?.trim(), undefined)
    const isActive = isValidBooleanString(searchParams.get("is-active")) ? stringToBooleanWithDefault(searchParams.get("is-active")) : undefined;
    const securityRoleId = isValidValueWithDefault(searchParams.get("security-role-id"), undefined);
    const jobTitleId = isValidValueWithDefault(searchParams.get("job-title-id"), undefined);

    return useMutation({
        mutationFn: () => getEmployeesActionAsync({
            query,
            fullName,
            isActive,
            securityRoleId,
            jobTitleId
        }),
    });
}
