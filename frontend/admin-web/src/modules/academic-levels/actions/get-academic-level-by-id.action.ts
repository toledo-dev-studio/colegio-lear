import { api } from "@/api/client";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import { sleep } from "@/lib/utils";

export const getAcademicLevelByIdAction = async (id: string): Promise<AcademicLevel> => {
    
    if (!id)
        throw new Error('Id del nivel académico es requerido');
    
    if (id === 'new') {
        return {
            id: 'new',
            name: '',
            description: '',
            status: true
        } as unknown as AcademicLevel;
    }
    
    await sleep();

    // const { data } = await api.get<AcademicLevel>(`/academic-levels/${id}`);
    const { data } = await api.get<AcademicLevel[]>(`/academic-levels/academic-levels.json`);
    
    // DELETE THIS LOGIC
    const academicLevel = data.find(item => item.id === id);
    if (!academicLevel)
        throw new Error('No se encontró el nivel académico');
    // DELETE THIS LOGIC

    return {
        ...academicLevel,
        // data
    }
}
