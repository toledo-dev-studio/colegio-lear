import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteSchoolSubjectGradeByIdAsync } from "../api/delete-school-subject-grade-by-id.api";
import { GET_SCHOOL_SUBJECT_GRADES_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";

export const useDeleteSchoolSubjectGradeById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteSchoolSubjectGradeByIdAsync,
        onSuccess: (response) => {
            // Invalid cache for useGetSchoolSubjectGrades
            queryClient.invalidateQueries({
                queryKey: [GET_SCHOOL_SUBJECT_GRADES_QUERY_KEY, {
                    academicCycleSchoolGroupId: response.academicCycleSchoolGroupId,
                    schoolSubjectId: response.schoolSubjectId,
                }]
            });
        }
    });
}