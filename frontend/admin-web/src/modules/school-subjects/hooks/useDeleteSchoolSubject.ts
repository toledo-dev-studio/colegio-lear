import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteSchoolSubjectByIdActionAsync } from "../actions/delete-school-subject-by-id.action";
import { GET_PAGED_SCHOOL_SUBJECTS_QUERY_KEY } from "../../../lib/queries-key/school-subjects-queries-key";

export const useDeleteSchoolSubject = () => {

    const queryClient = useQueryClient();

    const deleteSchoolSubject = useMutation({
        mutationFn: ({ id }: { id?: string }) => deleteSchoolSubjectByIdActionAsync(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_SCHOOL_SUBJECTS_QUERY_KEY] });
        }
    });

    return {
        deleteSchoolSubject
    };
}