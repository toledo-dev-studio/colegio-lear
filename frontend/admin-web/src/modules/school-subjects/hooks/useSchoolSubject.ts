import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";

import { getSchoolSubjectByIdActionAsync } from "../actions/get-school-subject-by-id.action";
import { CreateUpdateSchoolSubjectAction } from "../actions/create-update-school-subject.action";
import { GET_SCHOOL_SUBJECT_QUERY_KEY } from "../lib/queries-key";

export const useSchoolSubject = (id?: string) => {

    const { id: paramId } = useParams();
    const queryClient = useQueryClient();

    const currentId = id || paramId || '';

    const query = useQuery({
        queryKey: [GET_SCHOOL_SUBJECT_QUERY_KEY, currentId],
        queryFn: () => getSchoolSubjectByIdActionAsync(currentId),
        enabled: !!currentId && currentId !== 'new'
    });

    const mutation = useMutation({
        mutationFn: CreateUpdateSchoolSubjectAction,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: [GET_SCHOOL_SUBJECT_QUERY_KEY] });
            queryClient.setQueryData([GET_SCHOOL_SUBJECT_QUERY_KEY, data.id], data);
        }
    });

    return {
        ...query,
        mutation
    };
}