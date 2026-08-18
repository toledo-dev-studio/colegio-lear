import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { SecurityRoleResponse } from "@/interfaces/responses/security-role.response";

interface Options {
    id: string;
}

export const getSecurityRoleByIdAsync = async ({ id }: Options): Promise<SecurityRoleResponse> => {
    await sleep();
    
    if (IS_MOCKABLE) {
        const { data } = await api.get<SecurityRoleResponse[]>("/security-roles/security-roles.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        return record;
    }

    const { data } = await api.get<SecurityRoleResponse>(`/security-roles/${id}`);

    return data;
}
