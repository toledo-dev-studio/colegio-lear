import { api } from "@/api/client";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";

import { sleep } from "@/lib/utils";

export const getSchoolSubjectByIdActionAsync = async (id: string): Promise<SchoolSubject> => {
    await sleep();

    const { data } = await api.get<SchoolSubject>(`/school-subjects/${id}.json`);

    return data;
}