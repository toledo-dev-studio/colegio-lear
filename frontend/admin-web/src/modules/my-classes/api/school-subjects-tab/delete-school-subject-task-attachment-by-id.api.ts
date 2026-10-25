import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";

interface Options {
    attachmentId: string;
    taskId: string;
    academicCycleSchoolGroupId: string;
    schoolSubjectId: string;
}

export const deleteSchoolSubjectTaskAttachmentByIdAsync = async ({ attachmentId, taskId, academicCycleSchoolGroupId, schoolSubjectId }: Options): Promise<{ attachmentId: string, taskId: string, academicCycleSchoolGroupId: string, schoolSubjectId: string }> => {
    await sleep();

    if (IS_MOCKABLE)
        return { attachmentId, taskId, academicCycleSchoolGroupId, schoolSubjectId };

    await api.delete(`/me/school-groups/${academicCycleSchoolGroupId}/subjects/${schoolSubjectId}/tasks/${taskId}/attachments/${attachmentId}`);

    return { attachmentId, taskId, academicCycleSchoolGroupId, schoolSubjectId };
}