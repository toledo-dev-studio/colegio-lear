import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AcademicCycleSchoolGroup } from "@/interfaces/entites/academic-cycle-school-group";
import { GET_ACADEMIC_CYCLE_SCHOOL_GROUPS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { createUpdateSchoolGroupForAcademicCycleActionAsync } from "../../actions/school-groups/create-update-school-group-for-academic-cycle";

export const useCreateUpdateSchoolGroupForAcademicCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateSchoolGroupForAcademicCycleActionAsync,
        onSuccess: (response: AcademicCycleSchoolGroup) => {
            // Set query data for academic cycle school groups list to avoid refetch api
            queryClient.setQueryData(
                [GET_ACADEMIC_CYCLE_SCHOOL_GROUPS_QUERY_KEY, { academicCycleId: response.academicCycleId }],
                (prev: AcademicCycleSchoolGroup[] = []) => {
                    const index = prev.findIndex(item => item.id === response.id);
                    if (index === -1)
                        return [...prev, response]
                    prev[index] = response;
                    return prev;
                }
            );
        }
    });
}
