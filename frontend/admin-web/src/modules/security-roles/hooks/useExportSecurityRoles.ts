import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { GET_SECURITY_ROLES_QUERY_KEY } from "../lib/queries-key";
import { stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getSecurityRolesActionAsync } from "../actions/get-security-roles.action";

export const useExportSecurityRoles = () => {

    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';
    
    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_SECURITY_ROLES_QUERY_KEY, { query, name, status }],
        queryFn: () => getSecurityRolesActionAsync({
            query,
            name,
            status
        }),
        enabled: false,
    });
}
