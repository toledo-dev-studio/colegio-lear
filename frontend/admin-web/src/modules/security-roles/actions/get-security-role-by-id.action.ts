import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { SecurityRole } from "@/interfaces/entites/security-role";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const getSecurityRoleByIdActionAsync = async (id?: string): Promise<SecurityRole> => {
    await sleep();

    if (!id)
        throw new Error("El identificador del registro es requerido");

    if (id === "new") {
        return {
            id: undefined,
            name: "",
            description: "",
            status: true
        } as unknown as SecurityRole;
    }

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<SecurityRole[]>("/security-roles/security-roles.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        return record;
    }

    const { data } = await api.get<SecurityRole>(`/security-roles/${id}`);

    console.log(data);
    

    return data;
}
