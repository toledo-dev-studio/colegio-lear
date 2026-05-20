import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    query?: string;
    name?: string;
    status?: boolean;
    academicLevelId?: string;
    educationLevelId?: string;
}

export const getSchoolSubjectsActionAsync = async ({ query, name, status, academicLevelId, educationLevelId }: Options): Promise<SchoolSubject[]> => {
    await sleep();

    let endpoint = "/school-subjects";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/school-subjects/school-subjects.json";

    const { data } = await api.get<SchoolSubject[]>(endpoint, {
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