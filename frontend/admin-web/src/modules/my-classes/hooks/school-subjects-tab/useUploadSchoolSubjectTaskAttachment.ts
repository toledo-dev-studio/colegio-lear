import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadSchoolSubjectTaskAttachmentAsync } from "../../api/school-subjects-tab/upload-school-subject-task-attachment.api";
import { GET_SCHOOL_SUBJECT_TASKS_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";

export const useUploadSchoolSubjectTaskAttachment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: uploadSchoolSubjectTaskAttachmentAsync,
        onSuccess: (_response, variables) => {
            // Invalid cache for useGetSchoolSubjectTasks
            queryClient.invalidateQueries({
                queryKey: [GET_SCHOOL_SUBJECT_TASKS_QUERY_KEY, {
                    academicCycleSchoolGroupId: variables.academicCycleSchoolGroupId,
                    schoolSubjectId: variables.schoolSubjectId,
                }]
            });
        }
    });
}