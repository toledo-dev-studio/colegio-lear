import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_ACADEMIC_CYCLE_SCHOOL_SUBJECTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import type { AcademicCycleSchoolSubjectResponse } from "@/interfaces/responses/academic-cycle-school-subject.response";
import { createUpdateAcademicCycleSchoolSubjectActionAsync } from "../../actions/academic-cycle-school-subjects/create-update-school-subject-for-academic-cycle.action";

export const useCreateUpdateAcademicCycleSchoolSubject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateAcademicCycleSchoolSubjectActionAsync,
        onSuccess: (response: AcademicCycleSchoolSubjectResponse) => {
            // Set query data for academic cycle school subjects list to avoid refetch api
            queryClient.setQueryData(
                [GET_ACADEMIC_CYCLE_SCHOOL_SUBJECTS_QUERY_KEY, { academicCycleId: response.academicCycleId }],
                (prev: AcademicCycleSchoolSubjectResponse[] = []) => {
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
