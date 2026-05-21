import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getSecurityRolesActionAsync } from "../actions/get-security-roles.action";

export const useExportSecurityRoles = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';
    
    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useMutation({
        mutationFn: () => getSecurityRolesActionAsync({
            query,
            name,
            status
        }),
    });
}
