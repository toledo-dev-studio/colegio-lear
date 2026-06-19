import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";

interface Options {
    id: string;
}

export const getSchoolSubjectByIdActionAsync = async ({ id }: Options): Promise<SchoolSubjectResponse> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<SchoolSubjectResponse[]>("/school-subjects/school-subjects.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        return record;
    }

    const { data } = await api.get<SchoolSubjectResponse>(`/school-subjects/${id}`);

    return data;
}