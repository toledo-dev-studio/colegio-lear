import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { SchoolSubjectTaskRequest } from "@/interfaces/requests/school-subject-task.request";
import type { SchoolSubjectTaskResponse } from "@/interfaces/responses/school-subject-task.response";

interface Options {
    id: string;
    academicCycleSchoolGroupId: string;
    schoolSubjectId: string;
    taskRequestLike: Partial<SchoolSubjectTaskRequest>;
}

export const createUpdateSchoolSubjectTaskAsync = async ({ id, academicCycleSchoolGroupId, schoolSubjectId, taskRequestLike }: Options): Promise<SchoolSubjectTaskResponse> => {
    await sleep();

    if (IS_MOCKABLE)
        return {
            id: id === "new" ? generateTemporalId() : id,
            title: taskRequestLike.title ?? "",
            description: taskRequestLike.description,
            dueDate: taskRequestLike.dueDate,
            academicCycleSchoolGroupId,
            schoolSubjectId,
            attachments: [],
        };

    const { data } = await api.post<SchoolSubjectTaskResponse>(`/me/school-groups/${academicCycleSchoolGroupId}/subjects/${schoolSubjectId}/tasks`, {
        id: id === "new" ? undefined : id,
        ...taskRequestLike,
    });

    return data;
}