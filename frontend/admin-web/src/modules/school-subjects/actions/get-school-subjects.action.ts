import { api } from "@/api/client";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";

import { sleep } from "@/lib/utils";

interface Options {
    query?: string;
    name?: string;
    status?: boolean;
    academicLevelId?: string;
    educationLevelId?: string;
}

export const getSchoolSubjectsActionAsync = async ({ query = '', name, status, academicLevelId, educationLevelId }: Options): Promise<SchoolSubject[]> => {
    await sleep();

    const { data } = await api.get<SchoolSubject[]>('/school-subjects/school-subjects.json', {
        params: {
            q: query,
            name,
            status,
            academicLevelId,
            educationLevelId
        }
    });

    return data;
}