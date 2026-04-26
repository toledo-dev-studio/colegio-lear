import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteJobTitleByIdActionAsync } from "../actions/delete-job-title-by-id.action";
import { GET_JOB_TITLES_QUERY_KEY, GET_PAGED_JOB_TITLES_QUERY_KEY } from "../lib/queries-key";

export const useDeleteJobTitle = () => {

    const queryClient = useQueryClient();

    const deleteJobTitle = useMutation({
        mutationFn: deleteJobTitleByIdActionAsync,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GET_JOB_TITLES_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_JOB_TITLES_QUERY_KEY] });

            queryClient.refetchQueries({ queryKey: [GET_PAGED_JOB_TITLES_QUERY_KEY] })
        },
    })

    return {
        deleteJobTitle
    }
}
