import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createUpdateSchoolGroupAssistsAsync } from "../../api/attendance-tab/create-update-school-group-assists.api";
import { GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { GET_SCHOOL_GROUP_ASSISTS_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";

export const useCreateUpdateSchoolGroupAssists = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateSchoolGroupAssistsAsync,
        onSuccess: (_response, variables) => {
            // Invalid cache for useQueries
            queryClient.invalidateQueries({
                queryKey: [GET_SCHOOL_GROUP_ASSISTS_QUERY_KEY, {
                    academicCycleId: variables.academicCycleId,
                    schoolGroupId: variables.schoolGroupId,
                }]
            });

            queryClient.invalidateQueries({
                queryKey: [GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY, {
                    academicCycleId: variables.academicCycleId,
                }]
            });
        }
    });
}