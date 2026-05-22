import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import type { Attachment } from "@/interfaces/entites/attachment";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import { extractFileExtension, sanitizeFileName } from "@/lib/extensions/attachments";

export type Options = {
    announcementId: string;
    file: File;
};

export const uploadAttachmentsForAnnouncementActionAsync = async ({ announcementId, file }: Options): Promise<Attachment> => {
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
        } as Attachment;


    const formData = new FormData();
    formData.append("file", file);

    const { data, request } = await api<Attachment>({
        url: `attachments/announcement/${announcementId}`,
        method: "POST",
        data: formData
    });

    console.log(data, request);
    

    return data;
}
