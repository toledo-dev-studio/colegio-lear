import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import { extractFileExtension, sanitizeFileName } from "@/lib/extensions/attachments";
import type { SchoolSubjectMaterialResponse } from "@/interfaces/responses/school-subject-material.response";

interface Options {
    academicCycleSchoolGroupId: string;
    schoolSubjectId: string;
    file: File;
}

export const uploadSchoolSubjectMaterialAsync = async ({ academicCycleSchoolGroupId, schoolSubjectId, file }: Options): Promise<SchoolSubjectMaterialResponse> => {
    await sleep();

    if (IS_MOCKABLE)
        return {
            id: generateTemporalId(),
            url: `https://fake-storage.com/files/${sanitizeFileName(file.name)}`,
            name: file.name,
            extension: extractFileExtension(file.name),
            relatedRecordId: schoolSubjectId,
            academicCycleSchoolGroupId,
            schoolSubjectId,
        };

    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api<SchoolSubjectMaterialResponse>({
        url: `/me/school-groups/${academicCycleSchoolGroupId}/subjects/${schoolSubjectId}/materials`,
        method: "POST",
        data: formData
    });

    return data;
}