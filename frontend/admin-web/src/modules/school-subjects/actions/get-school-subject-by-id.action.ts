import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const getSchoolSubjectByIdActionAsync = async (id?: string): Promise<SchoolSubject> => {
    await sleep();

    if (!id)
        throw new Error("El identificador del registro es requerido");

    if (id === "new") {
        return {
            id: undefined,
            name: "",
            description: "",
            status: true,
            academicLevelId: "",
            educationLevelId: "",
        } as unknown as SchoolSubject;
    }

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<SchoolSubject[]>("/school-subjects/school-subjects.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        return record;
    }

    const { data } = await api.get<SchoolSubject>(`/school-subjects/${id}`);

    return data;
}