import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import { extractFileExtension, sanitizeFileName } from "@/lib/extensions/attachments";
import type { AttachmentResponse } from "@/interfaces/responses/attachment.response";

interface Options {
    taskId: string;
    academicCycleSchoolGroupId: string;
    schoolSubjectId: string;
    file: File;
}

export const uploadSchoolSubjectTaskAttachmentAsync = async ({ taskId, academicCycleSchoolGroupId, schoolSubjectId, file }: Options): Promise<AttachmentResponse> => {
    await sleep();

    if (IS_MOCKABLE)
        return {
            id: generateTemporalId(),
            url: `https://fake-storage.com/files/${sanitizeFileName(file.name)}`,
            name: file.name,
            extension: extractFileExtension(file.name),
            relatedRecordId: taskId,
        };

    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api<AttachmentResponse>({
        url: `/me/school-groups/${academicCycleSchoolGroupId}/subjects/${schoolSubjectId}/tasks/${taskId}/attachments`,
        method: "POST",
        data: formData
    });

    return data;
}