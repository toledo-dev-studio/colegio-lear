import { api } from "@/api/client";
import { generateTemporalId } from "@/lib/extensions/utils";
import type { Attachment } from "@/interfaces/entites/attachment";
import { extractFileExtension, sanitizeFileName } from "@/lib/extensions/attachments";
import { sleep } from "@/lib/extensions/promises";

export type Options = {
    announcementId: string;
    file: File;
};

export const uploadAttachmentsForAnnouncementActionAsync = async ({ announcementId, file }: Options): Promise<Attachment> => {
    await sleep();
    if (!announcementId)
        throw ("Announcement unique identifier can not be undefined");

    // TODO: Remove this comment when backend ready
    // const formData = new FormData();
    // formData.append('file', file);

    // const { data } = await api<Attachment>({
    //     url: `attachments/announcement/${announcementId}`,
    //     method: 'POST',
    //     data: formData
    // });
    // return data;
    // TODO: Remove this comment when backend ready



    // TODO: Remove this code when backend ready
    return {
        id: generateTemporalId(),
        url: `https://fake-storage.com/files/${sanitizeFileName(file.name)}`,
        name: file.name,
        extension: extractFileExtension(file.name),
        relatedRecordId: announcementId
    } as Attachment;
    // TODO: Remove this code when backend ready
}
