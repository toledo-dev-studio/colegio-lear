import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AcademicCycleSchoolGroup } from "@/interfaces/entites/academic-cycle-school-group";
import { GET_ACADEMIC_CYCLE_SCHOOL_GROUPS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { deleteSchoolGroupByIdForAcademicCycleActionAsync } from "../../actions/school-groups/delete-school-group-by-id-for-academic-cycle";

export const useDeleteSchoolGroupByIdForAcademicCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteSchoolGroupByIdForAcademicCycleActionAsync,
        onSuccess: (response: { academicCycleId: string, academicCycleSchoolGroupId: string }) => {
            // Set query data for academic cycle school groups list to avoid refetch api
            queryClient.setQueryData(
                [GET_ACADEMIC_CYCLE_SCHOOL_GROUPS_QUERY_KEY, { academicCycleId: response.academicCycleId }], 
                (prev: AcademicCycleSchoolGroup[] = []) => [...prev.filter(item => item.id !== response.academicCycleSchoolGroupId)]
            );
        },
    });
}
