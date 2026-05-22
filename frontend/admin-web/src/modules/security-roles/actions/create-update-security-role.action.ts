import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import type { SecurityRole } from "@/interfaces/entites/security-role";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const createUpdateSecurityRoleActionAsync = async (securityRoleLike: Partial<SecurityRole>): Promise<SecurityRole> => {
    await sleep();

    const { id } = securityRoleLike;
    const isCreating = id === undefined;

    if(VITE_ENVIRONMENT === "mockable") {
        securityRoleLike.id = isCreating ? generateTemporalId() : id;
        return securityRoleLike as SecurityRole;
    }

    console.log(securityRoleLike);
    

    const { data } = await api<SecurityRole>({
        url: isCreating ? "/security-roles" : `/security-roles/${id}`,
        method: isCreating ? "POST" : "PATCH",
        data: securityRoleLike
    });

    console.log(data);

    return {
        ...data,
    };
}
