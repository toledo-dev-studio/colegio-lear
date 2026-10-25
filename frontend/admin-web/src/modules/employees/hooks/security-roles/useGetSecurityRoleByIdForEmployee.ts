import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { SecurityRoleResponse } from "@/interfaces/responses/security-role.response";
import { getSecurityRoleByIdAsync } from "@/modules/security-roles/api/get-security-role-by-id.api";

export const useGetSecurityRoleByIdForEmployee = () => {
    const [securityRole, setSecurityRole] = useState<SecurityRoleResponse>();

    const mutation = useMutation({
        mutationFn: (id: string) => getSecurityRoleByIdAsync({ id })
    });

    const searchAsync = async (id: string) => {
        return mutation.mutateAsync(id, {
            onSuccess: (response: SecurityRoleResponse) => {
                setSecurityRole(response);
            },
            onError: () => {
                setSecurityRole(undefined);
            }
        });
    }

    return {
        securityRole,
        isError: mutation.isError,
        isPending: mutation.isPending,
        searchAsync,
        setSecurityRole,
    }
}
