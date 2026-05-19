import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteJobTitleByIdActionAsync } from "../actions/delete-job-title-by-id.action";
import { GET_JOB_TITLE_QUERY_KEY, GET_PAGED_JOB_TITLES_QUERY_KEY } from "@/lib/queries-key/job-titles-queries-key";

export const useDeleteJobTitle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteJobTitleByIdActionAsync,
        onSuccess: (id: string) => {
            // Remove query for single query
            queryClient.removeQueries({ queryKey: [GET_JOB_TITLE_QUERY_KEY, { id: id }] });

            // Invalid cache for useQueries, on invalid queries refetch is auto
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_JOB_TITLES_QUERY_KEY] });
        },
    });
}
