import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { SchoolSubjectTaskResponse } from "@/interfaces/responses/school-subject-task.response";

interface Options {
    academicCycleSchoolGroupId: string;
    schoolSubjectId: string;
}

export const getSchoolSubjectTasksAsync = async ({ academicCycleSchoolGroupId, schoolSubjectId }: Options): Promise<SchoolSubjectTaskResponse[]> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<SchoolSubjectTaskResponse[]>("/my-classes/school-subject-tasks.json");
        return data.filter(task => task.academicCycleSchoolGroupId === academicCycleSchoolGroupId && task.schoolSubjectId === schoolSubjectId);
    }

    const { data } = await api.get<SchoolSubjectTaskResponse[]>(`/me/school-groups/${academicCycleSchoolGroupId}/subjects/${schoolSubjectId}/tasks`);

    return data;
}