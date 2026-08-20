import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteSchoolSubjectTaskByIdAsync } from "../../api/school-subjects-tab/delete-school-subject-task-by-id.api";
import { GET_SCHOOL_SUBJECT_TASKS_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";

export const useDeleteSchoolSubjectTaskById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteSchoolSubjectTaskByIdAsync,
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