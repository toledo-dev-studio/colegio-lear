import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { SecurityRoleRequest } from "@/interfaces/requests/security-role.request";
import type { SecurityRoleResponse } from "@/interfaces/responses/security-role.response";

interface Options {
    id: string;
    securityRoleRequestLike: Partial<SecurityRoleRequest>;
}

export const createUpdateSecurityRoleAsync = async ({ id, securityRoleRequestLike }: Options): Promise<SecurityRoleResponse> => {
    await sleep();

    const isCreating = id === "new";

    if (IS_MOCKABLE) {
        return { 
            ...securityRoleRequestLike,
            id: isCreating ? generateTemporalId() : id,
        } as SecurityRoleResponse;
    }

    const { data } = await api<SecurityRoleResponse>({
        url: isCreating ? "/security-roles" : `/security-roles/${id}`,
        method: isCreating ? "POST" : "PATCH",
        data: securityRoleRequestLike
    });

    return {
        ...data,
    };
}
