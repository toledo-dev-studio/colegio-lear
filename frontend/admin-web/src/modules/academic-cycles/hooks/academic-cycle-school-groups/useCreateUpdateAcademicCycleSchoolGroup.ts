import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_ACADEMIC_CYCLE_SCHOOL_GROUP_QUERY_KEY, GET_ACADEMIC_CYCLE_SCHOOL_GROUPS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import type { AcademicCycleSchoolGroupResponse } from "@/interfaces/responses/academic-cycle-school-group.response";
import { createUpdateAcademicCycleSchoolGroupActionAsync } from "../../actions/academic-cycle-school-groups/create-update-academic-cycle-school-group.action";

export const useCreateUpdateAcademicCycleSchoolGroup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateAcademicCycleSchoolGroupActionAsync,
        onSuccess: (response: AcademicCycleSchoolGroupResponse) => {
            // Invalid cache for useQueries
            queryClient.invalidateQueries({ 
                queryKey: [GET_ACADEMIC_CYCLE_SCHOOL_GROUPS_QUERY_KEY, { academicCycleId: response.academicCycleId }] 
            });

            // Set data to query data for created/updated record
            queryClient.setQueryData([GET_ACADEMIC_CYCLE_SCHOOL_GROUP_QUERY_KEY, { id: response.id, academicCycleId: response.academicCycleId }], response);
        }
    });
}
