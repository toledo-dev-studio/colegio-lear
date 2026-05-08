import { api } from "@/api/client";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";

import { sleep } from "@/lib/utils";

export const getSchoolSubjectByIdActionAsync = async (id: string): Promise<SchoolSubject> => {
    if (!id)
        throw new Error('Id del puesto es requerido');

    if(id === "new") {
        return {
            id: "new",
            name: "",
            description: "",
            status: true,
            academicLevelId: "",
            educationLevelId: "",
        }
    }

    await sleep();

    // const { data } = await api.get<SchoolSubject>(`/school-subjects/${id}.json`);

    const { data } = await api.get<SchoolSubject[]>(`/school-subjects/school-subjects.json`);
        
        // DELETE THIS LOGIC
        const response = data.find(item => item.id === id);
        if (!response)
            throw new Error('No se encontró la materia escolar');
        // DELETE THIS LOGIC

    return {
        ...response
    };
}