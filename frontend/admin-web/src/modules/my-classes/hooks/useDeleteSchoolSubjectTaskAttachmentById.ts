import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteSchoolSubjectTaskAttachmentByIdAsync } from "../api/delete-school-subject-task-attachment-by-id.api";
import { GET_SCHOOL_SUBJECT_TASKS_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";

export const useDeleteSchoolSubjectTaskAttachmentById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteSchoolSubjectTaskAttachmentByIdAsync,
        onSuccess: (response) => {
            // Invalid cache for useGetSchoolSubjectTasks
            queryClient.invalidateQueries({
                queryKey: [GET_SCHOOL_SUBJECT_TASKS_QUERY_KEY, {
                    academicCycleSchoolGroupId: response.academicCycleSchoolGroupId,
                    schoolSubjectId: response.schoolSubjectId,
                }]
            });
        }
    });
}