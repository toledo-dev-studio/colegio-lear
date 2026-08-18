import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { getSecurityRolesAsync } from "../api/get-security-roles.api";
import { isValidBooleanString, isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";

export const useGetSecurityRoles = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);

    // Advanced query filters
    const name = isValidValueWithDefault(searchParams.get("name")?.trim(), undefined)
    const isActive = isValidBooleanString(searchParams.get("is-active")) ? stringToBooleanWithDefault(searchParams.get("is-active")) : undefined;

    return useMutation({
        mutationFn: () => getSecurityRolesAsync({
            query,
            name,
            isActive
        }),
    });
}
