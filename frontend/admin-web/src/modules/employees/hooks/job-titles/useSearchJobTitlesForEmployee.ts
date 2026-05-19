import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { JobTitle } from "@/interfaces/entites/job-title.interface";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import { getPagedJobTitlesActionAsync } from "@/modules/job-titles/actions/get-paged-job-titles.action";

export const useSearchJobTitlesForEmployee = () => {
    const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);

    const mutation = useMutation({
        mutationFn: (query: string) => getPagedJobTitlesActionAsync({ query, page: 1, pageSize: 5, status: true }),
    });

    const searchAsync = async (query: string) => {
        mutation.mutateAsync(query, {
            onSuccess: (response: PagedResponse<JobTitle>) => {
                setJobTitles(response.data);
            },
            onError: () => {
                setJobTitles([]);
            }
        });
    }
    return {
        jobTitles,
        isPending: mutation.isPending,
        searchAsync,
        clearSearchResult: () => setJobTitles([]),
    }
}
