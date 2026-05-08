import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { Scholarship } from "@/interfaces/entites/scholarship";
import { CreateUpdateScholarshipActionAsync } from "../actions/create-update-scholarship.action";
import { GET_PAGED_SCHOLARSHIPS_QUERY_KEY, GET_SCHOLARSHIP_QUERY_KEY, GET_SCHOLARSHIPS_QUERY_KEY } from "../lib/queries-key";
import { getScholarshipByIdActionAsync } from "../actions/get-scholarships-by-id.action";

export const useScholarship = (id: string) => {

    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [GET_SCHOLARSHIP_QUERY_KEY, { id }],
        queryFn: () => getScholarshipByIdActionAsync(id),
        retry: false,
        staleTime: 0,
    });

    const mutation = useMutation({
        mutationFn: CreateUpdateScholarshipActionAsync,
        onSuccess: (scholarship: Scholarship) => {
            // Invalidar cache de useQuery de consulta de todos los Scholarships
            queryClient.invalidateQueries({ queryKey: [GET_SCHOLARSHIPS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_SCHOLARSHIPS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_SCHOLARSHIP_QUERY_KEY, { id: scholarship.id }] });

            // Actualizar query data
            queryClient.setQueryData([GET_SCHOLARSHIP_QUERY_KEY, { id: scholarship.id }], scholarship);
        },
    });

    return {
        ...query,
        mutation,
    }

}