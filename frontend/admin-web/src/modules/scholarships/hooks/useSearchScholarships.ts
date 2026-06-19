import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { ScholarshipFilter } from "@/interfaces/filters/scholarship.filter";
import type { ScholarshipResponse } from "@/interfaces/responses/scholarship.response";
import { getPagedScholarshipsActionAsync } from "../actions/get-paged-scholarships.action";

interface Options extends ScholarshipFilter {
    query?: string;
}

export const useSearchScholarships = () => {
    const [scholarships, setScholarships] = useState<ScholarshipResponse[]>([])

    const mutation = useMutation({
        mutationFn: (options: Options) =>
            getPagedScholarshipsActionAsync({ ...options, page: 1, pageSize: 5 }),
    });

    const searchAsync = async (options: Options) => {
        mutation.mutateAsync(options, {
            onSuccess: (response: PagedResponse<ScholarshipResponse>) => {
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
