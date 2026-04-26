import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getJobTitleByIdAction } from "../actions/get-job-title-by-id.action";
import { GET_JOB_TITLE_QUERY_KEY, GET_JOB_TITLES_QUERY_KEY, GET_PAGED_JOB_TITLES_QUERY_KEY } from "../lib/queries-key";
import type { JobTitle } from "@/interfaces/entites/job-title.interface";
import { CreateUpdateJobTitleAction } from "../actions/create-update-job-title.action";

export const useJobTitle = (id: string) => {

    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [GET_JOB_TITLE_QUERY_KEY, { id }],
        queryFn: () => getJobTitleByIdAction(id),
        retry: false,
        staleTime: 0,
    });

    const mutation = useMutation({
        mutationFn: CreateUpdateJobTitleAction,
        onSuccess: (JobTitle: JobTitle) => {
            // Invalidar cache de useQuery de consulta de todos los JobTitleos
            queryClient.invalidateQueries({ queryKey: [GET_JOB_TITLES_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_JOB_TITLES_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_JOB_TITLE_QUERY_KEY, { id: JobTitle.id }] });

            // Actualizar query data
            queryClient.setQueryData([GET_JOB_TITLE_QUERY_KEY, { id: JobTitle.id }], JobTitle);
        },
    });

    return {
        ...query,
        mutation,
    }

}