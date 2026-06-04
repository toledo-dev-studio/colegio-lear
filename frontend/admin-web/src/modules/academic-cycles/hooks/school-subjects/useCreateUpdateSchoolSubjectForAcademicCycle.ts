import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AcademicCycleSchoolSubject } from "@/interfaces/entites/academic-cycle-school-subject";
import { GET_ACADEMIC_CYCLE_SCHOOL_SUBJECTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { createUpdateSchoolSubjectForAcademicCycleActionAsync } from "../../actions/school-subjects/create-update-school-subject-for-academic-cycle";

export const useCreateUpdateSchoolSubjectForAcademicCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateSchoolSubjectForAcademicCycleActionAsync,
        onSuccess: (response: AcademicCycleSchoolSubject) => {
            // Set query data for academic cycle school subjects list to avoid refetch api
            queryClient.setQueryData(
                [GET_ACADEMIC_CYCLE_SCHOOL_SUBJECTS_QUERY_KEY, { academicCycleId: response.academicCycleId }], 
                (prev: AcademicCycleSchoolSubject[] = []) => [...prev.filter(item => item.id !== response.id), response]
            );
        }
    });
}
