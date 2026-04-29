import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteScholarshipByIdActionAsync } from "../actions/delete-scholarship-by-id.action";
import { GET_PAGED_SCHOLARSHIPS_QUERY_KEY, GET_SCHOLARSHIPS_QUERY_KEY } from "../lib/queries-key";

export const useDeleteScholarship = () => {

    const queryClient = useQueryClient();

    const deleteScholarship = useMutation({
        mutationFn: deleteScholarshipByIdActionAsync,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GET_SCHOLARSHIPS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_SCHOLARSHIPS_QUERY_KEY] });

            queryClient.refetchQueries({ queryKey: [GET_PAGED_SCHOLARSHIPS_QUERY_KEY] });
        },
    })

    return {
        deleteScholarship
    }
}
