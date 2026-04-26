import { api } from "@/api/client";
import type { JobTitle } from "@/interfaces/entites/job-title.interface";
import { sleep } from "@/lib/utils";

export const getJobTitleByIdAction = async (id: string): Promise<JobTitle> => {
    
    if (!id)
        throw new Error('Id del puesto es requerido');
    
    if (id === 'new') {
        return {
            id: 'new',
            name: '',
            description: '',
            status: true
        } as unknown as JobTitle;
    }
    
    await sleep();

    // const { data } = await api.get<JobTitle>(`/job-titles/${id}`);
    const { data } = await api.get<JobTitle[]>(`/job-titles.json`);
    
    // DELETE THIS LOGIC
    const jobTitle = data.find(item => item.id === id);
    if (!jobTitle)
        throw new Error('No se encontró el puesto de trabajo');
    // DELETE THIS LOGIC

    return {
        ...jobTitle,
        // data
    }
}
