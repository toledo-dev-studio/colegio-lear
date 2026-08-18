import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteJobTitleByIdAsync } from "../api/delete-job-title-by-id.api";
import { GET_JOB_TITLE_QUERY_KEY, GET_PAGED_JOB_TITLES_QUERY_KEY } from "@/lib/queries-key/job-titles-queries-key";

export const useDeleteJobTitleById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteJobTitleByIdAsync,
        onSuccess: (id: string) => {
            // Remove query for single query
            queryClient.removeQueries({ queryKey: [GET_JOB_TITLE_QUERY_KEY, { id: id }] });

            // Invalid cache for useQueries, on invalid queries refetch is auto
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_JOB_TITLES_QUERY_KEY] });
        },
    });
}
