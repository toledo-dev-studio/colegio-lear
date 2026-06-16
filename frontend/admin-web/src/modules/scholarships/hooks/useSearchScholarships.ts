import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { PagedResponse } from "@/interfaces/responses/paged.response";
import { getPagedScholarshipsActionAsync } from "../actions/get-paged-scholarships.action";
import type { Scholarship } from "@/interfaces/entites/scholarship";

interface Options {
    query?: string;
    status?: boolean;
}

export const useSearchScholarships = () => {
    const [scholarships, setScholarships] = useState<Scholarship[]>([])

    const mutation = useMutation({
        mutationFn: (options: Options) =>
            getPagedScholarshipsActionAsync({ ...options, page: 1, pageSize: 5 }),
    });

    const searchAsync = async (options: Options) => {
        mutation.mutateAsync(options, {
            onSuccess: (response: PagedResponse<Scholarship>) => {
                setScholarships(response.data);
            },
            onError: () => {
                setScholarships([]);
            }
        });
    }

    return {
        scholarships,
        isPending: mutation.isPending,
        searchAsync,
        clearSearchResult: () => setScholarships([]),
    }
}
