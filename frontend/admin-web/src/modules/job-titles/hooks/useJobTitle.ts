import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { JobTitle } from "@/interfaces/entites/job-title.interface";
import { getJobTitleByIdActionAsync } from "../actions/get-job-title-by-id.action";
import { CreateUpdateJobTitleActionAsync } from "../actions/create-update-job-title.action";
import { GET_JOB_TITLE_QUERY_KEY, GET_JOB_TITLES_QUERY_KEY, GET_PAGED_JOB_TITLES_QUERY_KEY } from "../lib/queries-key";

export const useJobTitle = (id: string) => {

    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [GET_JOB_TITLE_QUERY_KEY, { id }],
        queryFn: () => getJobTitleByIdActionAsync(id),
        retry: false,
        staleTime: 0,
    });

    const mutation = useMutation({
        mutationFn: CreateUpdateJobTitleActionAsync,
        onSuccess: (jobTitle: JobTitle) => {
            // Invalidar cache de useQuery de consulta de todos los Jobtitles
            queryClient.invalidateQueries({ queryKey: [GET_JOB_TITLES_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_JOB_TITLES_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_JOB_TITLE_QUERY_KEY, { id: jobTitle.id }] });

            // Actualizar query data
            queryClient.setQueryData([GET_JOB_TITLE_QUERY_KEY, { id: jobTitle.id }], jobTitle);
        },
    });

    return {
        ...query,
        mutation,
    }

}