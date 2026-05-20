import { useSearchParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { getPagedSecurityRolesActionAsync } from "../actions/get-paged-security-roles.action";
import { GET_PAGED_SECURITY_ROLES_QUERY_KEY } from "@/lib/queries-key/security-roles-queries-key";
import { stringToBooleanWithDefault, stringToNumberWithDefault } from "@/lib/extensions/datatypes";

export const useGetPagedSecurityRoles = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get('query')?.trim() || '';
    const page = stringToNumberWithDefault(searchParams.get('page'), 1);
    const pageSize = stringToNumberWithDefault(searchParams.get('pageSize'), 10);
    
    // Advanced query filters
    const name = searchParams.get('name')?.trim() || '';
    const status = stringToBooleanWithDefault(searchParams.get('status'));

    return useQuery({
        queryKey: [GET_PAGED_SECURITY_ROLES_QUERY_KEY, { query, page, pageSize, name, status }],
        queryFn: () => getPagedSecurityRolesActionAsync({
            query,
            page,
            pageSize,
            name,
            status,
        }),
    });
}
