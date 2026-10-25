import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteSchoolSubjectByIdAsync } from "../api/delete-school-subject-by-id.api";
import { GET_PAGED_SCHOOL_SUBJECTS_QUERY_KEY, GET_SCHOOL_SUBJECT_QUERY_KEY } from "@/lib/queries-key/school-subjects-queries-key";

export const useDeleteSchoolSubjectById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteSchoolSubjectByIdAsync,
        onSuccess: (id: string) => {
            // Remove query for single query
            queryClient.removeQueries({ queryKey: [GET_SCHOOL_SUBJECT_QUERY_KEY, { id: id }] });

            // Invalid cache for useQueries, on invalid queries refetch is auto
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_SCHOOL_SUBJECTS_QUERY_KEY] });
        }
    });
}