import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { SecurityRole } from "@/interfaces/entites/security-role";
import { getSecurityRoleByIdActionAsync } from "@/modules/security-roles/actions/get-security-role-by-id.action";

export const useGetByIdSecurityRoleForEmployee = () => {
    const [securityRole, setSecurityRole] = useState<SecurityRole>();

    const mutation = useMutation({
        mutationFn: (id: string) => getSecurityRoleByIdActionAsync(id)
    });

    const searchAsync = async (id: string) => {
        mutation.mutateAsync(id, {
            onSuccess: (response: SecurityRole) => {
                setSecurityRole(response);
            },
            onError: () => {
                setSecurityRole(undefined);
            }
        });
    }

    return {
        securityRole,
        isPending: mutation.isPending,
        searchAsync,
        setSecurityRole,
    }
}
