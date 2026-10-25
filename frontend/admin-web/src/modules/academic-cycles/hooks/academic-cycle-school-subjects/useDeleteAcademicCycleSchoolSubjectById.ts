import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_ACADEMIC_CYCLE_SCHOOL_SUBJECTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import type { AcademicCycleSchoolSubjectResponse } from "@/interfaces/responses/academic-cycle-school-subject.response";
import { deleteAcademicCycleSchoolSubjectByIdAsync } from "../../api/academic-cycle-school-subjects/delete-school-subject-by-id-for-academic-cycle.api";

export const useDeleteAcademicCycleSchoolSubjectById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAcademicCycleSchoolSubjectByIdAsync,
        onSuccess: (response: { id: string, academicCycleId: string }) => {
            // Set query data for academic cycle school subjects list to avoid refetch api
            queryClient.setQueryData(
                [GET_ACADEMIC_CYCLE_SCHOOL_SUBJECTS_QUERY_KEY, { academicCycleId: response.academicCycleId }], 
                (prev: AcademicCycleSchoolSubjectResponse[] = []) => [...prev.filter(item => item.id !== response.id)]
            );
        },
    });
}
