import { api } from "@/api/client";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";

import type { PagedResponse } from "@/interfaces/responses/paged.response";
import { sleep } from "@/lib/utils";

interface Options {
    query?: string;
    status?: boolean,
    academicLevelId?: string;
    educationLevelId?: string;
    page?: number;
    pageSize?: number;
}

export const getPagedSchoolSubjectsActionAsync = async ({ query = '', status = true, academicLevelId, educationLevelId, page = 1, pageSize = 1 }: Options): Promise<PagedResponse<SchoolSubject>> => {
    await sleep();

    const { data } = await api.get<PagedResponse<SchoolSubject>>('/paged-school-subjects.json', {
        params: {
            q: query,
            status,
            academicLevelId,
            educationLevelId,
            page,
            pageSize,
        }
    });

    return {
        ...data
    };
}