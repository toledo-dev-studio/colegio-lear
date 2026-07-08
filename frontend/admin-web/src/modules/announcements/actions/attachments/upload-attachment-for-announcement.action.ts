import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import { extractFileExtension, sanitizeFileName } from "@/lib/extensions/attachments";
import type { AttachmentResponse } from "@/interfaces/responses/attachment.response";

interface Options {
    announcementId: string;
    file: File;
};

export const uploadAttachmentForAnnouncementActionAsync = async ({ announcementId, file }: Options): Promise<AttachmentResponse> => {
    await sleep();

    if (!announcementId)
        throw ("Announcement unique identifier can not be undefined");

    if (VITE_ENVIRONMENT === "mockable")
        return {
            id: generateTemporalId(),
            url: `https://fake-storage.com/files/${sanitizeFileName(file.name)}`,
            name: file.name,
            extension: extractFileExtension(file.name),
            relatedRecordId: announcementId
        } as AttachmentResponse;


    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api<AttachmentResponse>({
        url: `attachments/announcement/${announcementId}`,
        method: "POST",
        data: formData
    });

    return data;
}
