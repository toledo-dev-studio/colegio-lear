import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { SecurityRoleFilter } from "@/interfaces/filters/security-role.filter";
import type { SecurityRoleResponse } from "@/interfaces/responses/security-role.response";
import { getPagedSecurityRolesActionAsync } from "@/modules/security-roles/actions/get-paged-security-roles.action";

interface Options extends SecurityRoleFilter {
    query?: string;
}

export const useSearchSecurityRoles = () => {
    const [securityRoles, setSecurityRoles] = useState<SecurityRoleResponse[]>([]);

    const mutation = useMutation({
        mutationFn: (options: Options) => getPagedSecurityRolesActionAsync({ ...options, page: 1, pageSize: 5 }),
    });

    const searchAsync = async (options: Options) => {
        mutation.mutateAsync(options, {
            onSuccess: (response: PagedResponse<SecurityRoleResponse>) => {
                setSecurityRoles(response.data);
            },
            onError: () => {
                setSecurityRoles([]);
            }
        });
    }

    return {
        securityRoles,
        isPending: mutation.isPending,
        searchAsync,
        clearSearchResult: () => setSecurityRoles([]),
    }
}
