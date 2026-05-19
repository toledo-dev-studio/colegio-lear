import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { JobTitle } from "@/interfaces/entites/job-title.interface";
import { CreateUpdateJobTitleActionAsync } from "../actions/create-update-job-title.action";
import { GET_JOB_TITLE_QUERY_KEY, GET_PAGED_JOB_TITLES_QUERY_KEY } from "@/lib/queries-key/job-titles-queries-key";

export const useCreateUpdateJobTitle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: CreateUpdateJobTitleActionAsync,
        onSuccess: (response: JobTitle) => {
            // Invalid cache for useQueries
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_JOB_TITLES_QUERY_KEY] });

            // Set data to query data for created/updated record
            queryClient.setQueryData([GET_JOB_TITLE_QUERY_KEY, { id: response.id }], response);
        },
    });
}
