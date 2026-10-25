import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { JobTitleFilter } from "@/interfaces/filters/job-title.filter";
import type { JobTitleResponse } from "@/interfaces/responses/job-title.response";
import { getPagedJobTitlesAsync } from "@/modules/job-titles/api/get-paged-job-titles.api";

interface Options extends JobTitleFilter {
    query?: string;
}

export const useSearchJobTitles = () => {
    const [jobTitles, setJobTitles] = useState<JobTitleResponse[]>([]);

    const mutation = useMutation({
        mutationFn: (options: Options) => getPagedJobTitlesAsync({ ...options, page: 1, pageSize: 5 }),
    });

    const searchAsync = async (options: Options) => {
        mutation.mutateAsync(options, {
            onSuccess: (response: PagedResponse<JobTitleResponse>) => {
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
