import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import { getPagedAcademicLevelsActionAsync } from "@/modules/academic-levels/actions/get-paged-academic-levels.action";

export const useSearchAcademicLevelsForSchoolSubject = () => {
    const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>([])

    const mutation = useMutation({
        mutationFn: (query: string) => getPagedAcademicLevelsActionAsync({ query, page: 1, pageSize: 5, status: true }),
    });

    const searchAsync = async (query: string) => {
        mutation.mutateAsync(query, {
            onSuccess: (response: PagedResponse<AcademicLevel>) => {
                setAcademicLevels(response.data);
            },
            onError: () => {
                setAcademicLevels([]);
            }
        });
    }

    return {
        academicLevels,
        isPending: mutation.isPending,
        searchAsync,
        clearSearchResult: () => setAcademicLevels([]),
    }
}
