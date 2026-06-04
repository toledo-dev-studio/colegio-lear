import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteSchoolSubjectByIdActionAsync } from "../actions/delete-school-subject-by-id.action";
import { GET_PAGED_SCHOOL_SUBJECTS_QUERY_KEY, GET_SCHOOL_SUBJECT_QUERY_KEY } from "@/lib/queries-key/school-subjects-queries-key";

export const useDeleteSchoolSubject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteSchoolSubjectByIdActionAsync,
        onSuccess: (id: string) => {
            // Remove query for single query
            queryClient.removeQueries({ queryKey: [GET_SCHOOL_SUBJECT_QUERY_KEY, { id: id }] });

            // Invalid cache for useQueries, on invalid queries refetch is auto
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_SCHOOL_SUBJECTS_QUERY_KEY] });
        }
    });
}