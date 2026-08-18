import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteScholarshipByIdAsync } from "../api/delete-scholarship-by-id.api";
import { GET_PAGED_SCHOLARSHIPS_QUERY_KEY, GET_SCHOLARSHIP_QUERY_KEY } from "@/lib/queries-key/scholarships-queries-key";

export const useDeleteScholarshipById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteScholarshipByIdAsync,
        onSuccess: (id: string) => {
            // Remove query for single query
            queryClient.removeQueries({ queryKey: [GET_SCHOLARSHIP_QUERY_KEY, { id: id }] });
            
            // Invalid cache for useQueries, on invalid queries refetch is auto
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_SCHOLARSHIPS_QUERY_KEY] });
        },
    });
}
