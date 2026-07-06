import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_ACADEMIC_CYCLE_SCHOOL_GROUPS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { deleteAcademicCycleSchoolGroupByIdActionAsync } from "../../actions/academic-cycle-school-groups/delete-academic-cycle-school-group-by-id.action";
import type { AcademicCycleSchoolGroupResponse } from "@/interfaces/responses/academic-cycle-school-group.response";

export const useDeleteAcademicCycleSchoolGroupById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAcademicCycleSchoolGroupByIdActionAsync,
        onSuccess: (response: { id: string, academicCycleId: string }) => {
            // Set query data for academic cycle school groups list to avoid refetch api
            queryClient.setQueryData(
                [GET_ACADEMIC_CYCLE_SCHOOL_GROUPS_QUERY_KEY, { academicCycleId: response.academicCycleId }],
                (prev: AcademicCycleSchoolGroupResponse[] = []) => [...prev.filter(item => item.id !== response.id)]
            );
        },
    });
}
