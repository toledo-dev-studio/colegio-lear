import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { EducationLevel } from "@/interfaces/entites/education-level";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import { getPagedEducationLevelsActionAsync } from "@/modules/academic-levels/actions/get-paged-education-levels.action";

export const useSearchEducationLevelsForSchoolSubject = () => {
    const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);

    const mutation = useMutation({
        mutationFn: (params: { academicLevelId: string, query: string }) => getPagedEducationLevelsActionAsync({ academicLevelId: params.academicLevelId, query: params.query, page: 1, pageSize: 5, status: true }),
    });

    const searchAsync = async (params: { academicLevelId: string, query: string }) => {
        mutation.mutateAsync(params, {
            onSuccess: (response: PagedResponse<EducationLevel>) => {
                setEducationLevels(response.data);
            },
            onError: () => {
                setEducationLevels([]);
            }
        });
    }

    return {
        educationLevels,
        isPending: mutation.isPending,
        searchAsync,
        clearSearchResult: () => setEducationLevels([]),
    }
}
