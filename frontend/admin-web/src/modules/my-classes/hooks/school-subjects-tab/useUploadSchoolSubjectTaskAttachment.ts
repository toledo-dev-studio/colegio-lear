import { useMutation } from "@tanstack/react-query";

import { uploadSchoolSubjectTaskAttachmentAsync } from "../../api/school-subjects-tab/upload-school-subject-task-attachment.api";

export const useUploadSchoolSubjectTaskAttachment = () => {
    return useMutation({
        mutationFn: uploadSchoolSubjectTaskAttachmentAsync,
    });
}