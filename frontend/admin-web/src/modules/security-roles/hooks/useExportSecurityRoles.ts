import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router"

import { stringToBooleanWithDefault } from "@/lib/utils";
import { GET_SECURITY_ROLES_QUERY_KEY } from "../lib/queries-key";
import { getSecurityRolesActionAsync } from "../actions/get-security-roles.action";

export const useExportSecurityRoles = () => {

    const [searchParams] = useSearchParams();

    const query = searchParams.get('query')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_SECURITY_ROLES_QUERY_KEY, { query, status }],
        queryFn: () => getSecurityRolesActionAsync({
            query,
            status
        }),
        enabled: false,
    });
}
