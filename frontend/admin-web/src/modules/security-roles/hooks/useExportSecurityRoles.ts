import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { isValidBooleanString, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getSecurityRolesActionAsync } from "../actions/get-security-roles.action";

export const useExportSecurityRoles = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get("query")?.trim() || undefined;

    // Advanced query filters
    const name = searchParams.get("name")?.trim() || undefined;
    const status = isValidBooleanString(searchParams.get("status")) ? stringToBooleanWithDefault(searchParams.get("status")) : undefined;

    return useMutation({
        mutationFn: () => getSecurityRolesActionAsync({
            query,
            name,
            status
        }),
    });
}
