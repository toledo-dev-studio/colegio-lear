import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createUpdateSchoolSubjectGradeAsync } from "../api/create-update-school-subject-grade.api";
import { GET_SCHOOL_SUBJECT_GRADES_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";

export const useCreateUpdateSchoolSubjectGrade = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateSchoolSubjectGradeAsync,
        onSuccess: (_response, variables) => {
            // Invalid cache for useGetSchoolSubjectGrades
            queryClient.invalidateQueries({
                queryKey: [GET_SCHOOL_SUBJECT_GRADES_QUERY_KEY, {
                    academicCycleSchoolGroupId: variables.academicCycleSchoolGroupId,
                    schoolSubjectId: variables.schoolSubjectId,
                }]
            });
        }
    });
}