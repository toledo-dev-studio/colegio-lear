import { api } from "@/api/client";
import type { Scholarship } from "@/interfaces/entites/scholarship";

import { sleep } from "@/lib/utils";

export const getScholarshipByIdActionAsync = async (id: string): Promise<Scholarship> => {

    if (!id)
        throw new Error('Id del puesto es requerido');

    if (id === 'new') {
        return {
            id: 'new',
            name: '',
            description: '',
            status: true
        } as unknown as Scholarship;
    }

    await sleep();

    // const { data } = await api.get<Scholarship>(`/scholarships/${id}`);
    const { data } = await api.get<Scholarship[]>(`/scholarships/scholarships.json`);

    // DELETE THIS LOGIC
    const scholarship = data.find(item => item.id === id);
    if (!scholarship)
        throw new Error('No se encontró la beca');
    // DELETE THIS LOGIC

    return {
        ...scholarship,
        // data
    }
}
