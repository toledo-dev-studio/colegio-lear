import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createUpdateSchoolSubjectTaskAsync } from "../../api/school-subjects-tab/create-update-school-subject-task.api";
import { GET_SCHOOL_SUBJECT_TASKS_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";

export const useCreateUpdateSchoolSubjectTask = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateSchoolSubjectTaskAsync,
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