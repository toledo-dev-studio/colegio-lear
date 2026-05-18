import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";
import type { PagedResponse } from "@/interfaces/responses/paged.response";

interface Options {
    query?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    status?: boolean,
    academicLevelId?: string;
    educationLevelId?: string;
}

export const getPagedSchoolSubjectsActionAsync = async ({ query = '', page = 1, pageSize = 1, name, status, academicLevelId, educationLevelId }: Options): Promise<PagedResponse<SchoolSubject>> => {
    await sleep();

    const { data } = await api.get<PagedResponse<SchoolSubject>>('/school-subjects/paged-school-subjects.json', {
        params: {
            q: query,
            page,
            pageSize,
            name,
            status,
            academicLevelId,
            educationLevelId,
        }
    });

    return {
        ...data
    };
}