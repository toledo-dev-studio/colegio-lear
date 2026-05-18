import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getSchoolSubjectByIdActionAsync } from "../actions/get-school-subject-by-id.action";
import { createUpdateSchoolSubjectActionAsync } from "../actions/create-update-school-subject.action";
import { GET_PAGED_SCHOOL_SUBJECTS_QUERY_KEY, GET_SCHOOL_SUBJECT_QUERY_KEY, GET_SCHOOL_SUBJECTS_QUERY_KEY } from "../lib/queries-key";

export const useSchoolSubject = (id: string) => {

    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [GET_SCHOOL_SUBJECT_QUERY_KEY, { id }],
        queryFn: () => getSchoolSubjectByIdActionAsync(id),
        retry: false,
        staleTime: 0
    });

    const mutation = useMutation({
        mutationFn: createUpdateSchoolSubjectActionAsync,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [GET_SCHOOL_SUBJECTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_SCHOOL_SUBJECTS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_SCHOOL_SUBJECT_QUERY_KEY] });

            queryClient.setQueryData([GET_SCHOOL_SUBJECT_QUERY_KEY, data.id], data);
        }
    });

    return {
        ...query,
        mutation
    };
}
