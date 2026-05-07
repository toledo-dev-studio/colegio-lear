import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { SecurityRole } from "@/interfaces/entites/security-role";

export const CreateUpdateSecurityRoleActionAsync = async (securityRoleLike: Partial<SecurityRole>): Promise<SecurityRole> => {
    await sleep();

    const { id } = securityRoleLike;

    const isCreating = id === "new";

    const { data } = await api<SecurityRole>({
        url: isCreating ? '/security-roles' : `/security-roles/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: securityRoleLike
    });

    return {
        ...data,
    };
}
