import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ScholarshipResponse } from "@/interfaces/responses/scholarship.response";
import { createUpdateScholarshipActionAsync } from "../actions/create-update-scholarship.action";
import { GET_PAGED_SCHOLARSHIPS_QUERY_KEY, GET_SCHOLARSHIP_QUERY_KEY } from "@/lib/queries-key/scholarships-queries-key";

export const useCreateUpdateScholarship = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateScholarshipActionAsync,
        onSuccess: (response: ScholarshipResponse) => {
            // Invalid cache for useQueries
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_SCHOLARSHIPS_QUERY_KEY] });

            // Set data to query data for created/updated record
            queryClient.setQueryData([GET_SCHOLARSHIP_QUERY_KEY, { id: response.id }], response);
        },
    });
}