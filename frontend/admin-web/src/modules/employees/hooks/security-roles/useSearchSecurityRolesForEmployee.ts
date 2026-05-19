import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { SecurityRole } from "@/interfaces/entites/security-role";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import { getPagedSecurityRolesActionAsync } from "@/modules/security-roles/actions/get-paged-security-roles.action";

export const useSearchSecurityRolesForEmployee = () => {
    const [securityRoles, setSecurityRoles] = useState<SecurityRole[]>([]);

    const mutation = useMutation({
        mutationFn: (query: string) => getPagedSecurityRolesActionAsync({ query, page: 1, pageSize: 5, status: true }),
    });

    const searchAsync = async (query: string) => {
        mutation.mutateAsync(query, {
            onSuccess: (response: PagedResponse<SecurityRole>) => {
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
