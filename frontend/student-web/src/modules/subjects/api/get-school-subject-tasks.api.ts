import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { SchoolSubjectTaskResponse } from "@/interfaces/responses/school-subject-task.response";

export const SCHOOL_SUBJECT_TASKS_PAGE_SIZE = 5;

interface Options {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
    academicCycleSchoolSubjectId: string;
    page: number;
    pageSize?: number;
}

export const getSchoolSubjectTasksAsync = async ({
    academicCycleId,
    academicCycleSchoolGroupId,
    academicCycleSchoolSubjectId,
    page,
    pageSize = SCHOOL_SUBJECT_TASKS_PAGE_SIZE,
}: Options): Promise<PagedResponse<SchoolSubjectTaskResponse>> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<SchoolSubjectTaskResponse[]>("/subjects/tasks.json");

        // El backend ordena del más reciente al más viejo según su fecha de creación
        const tasks = data
            .filter((task) =>
                task.academicCycleId === academicCycleId &&
                task.academicCycleSchoolGroupId === academicCycleSchoolGroupId &&
                task.academicCycleSchoolSubjectId === academicCycleSchoolSubjectId,
            )
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        const totalPages = Math.max(1, Math.ceil(tasks.length / pageSize));
        const requestedPage = Math.min(page, totalPages);
        const start = (requestedPage - 1) * pageSize;
        const pagedTasks = tasks.slice(start, start + pageSize);

        return {
            data: pagedTasks,
            totalPages,
            currentPage: requestedPage,
            itemsCount: pagedTasks.length,
        };
    }

    const { data } = await api.get<PagedResponse<SchoolSubjectTaskResponse>>(
        `/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/school-subjects/${academicCycleSchoolSubjectId}/tasks`,
        {
            params: {
                page,
                pageSize,
            },
        },
    );

    return data;
}
