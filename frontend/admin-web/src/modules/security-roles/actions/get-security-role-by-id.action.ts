import { api } from "@/api/client";

import { sleep } from "@/lib/utils";
import type { SecurityRole } from "@/interfaces/entites/security-role";

export const getSecurityRoleByIdActionAsync = async (id?: string): Promise<SecurityRole> => {
    
    if (!id)
        throw new Error('El identificador del registro es requerido');
    
    if (id === 'new') {
        return {
            id: 'new',
            name: '',
            description: '',
            status: true
        } as unknown as SecurityRole;
    }
    
    await sleep();

    // const { data } = await api.get<SecurityRole>(`/security-roles/${id}`);
    const { data } = await api.get<SecurityRole[]>(`/security-roles/security-roles.json`);
    
    // DELETE THIS LOGIC
    const record = data.find(item => item.id === id);
    if (!record)
        throw new Error('No se encontró el registro solicitado');
    // DELETE THIS LOGIC
    

    return {
        ...record,
        // data
    }
}
