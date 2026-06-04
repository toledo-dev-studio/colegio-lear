import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AcademicCycleWallet } from "@/interfaces/entites/academic-cycle-wallet";
import { GET_ACADEMIC_CYCLE_SCHOOL_SUBJECTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { deleteSchoolSubjectByIdForAcademicCycleActionAsync } from "../../actions/school-subjects/delete-school-subject-by-id-for-academic-cycle";

export const useDeleteSchoolSubjectByIdForAcademicCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteSchoolSubjectByIdForAcademicCycleActionAsync,
        onSuccess: (response: { academicCycleId: string, academicCycleSchoolSubjectId: string }) => {
            // Set query data for academic cycle school subjects list to avoid refetch api
            queryClient.setQueryData(
                [GET_ACADEMIC_CYCLE_SCHOOL_SUBJECTS_QUERY_KEY, { academicCycleId: response.academicCycleId }], 
                (prev: AcademicCycleWallet[] = []) => [...prev.filter(item => item.id !== response.academicCycleSchoolSubjectId)]
            );
        },
    });
}
