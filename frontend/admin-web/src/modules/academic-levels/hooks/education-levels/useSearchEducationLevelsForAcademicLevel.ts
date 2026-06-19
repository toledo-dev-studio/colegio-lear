import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { EducationLevel } from "@/interfaces/entites/education-level";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { EducationLevelFilter } from "@/interfaces/filters/education-level.filter";
import { getPagedEducationLevelsActionAsync } from "@/modules/academic-levels/actions/get-paged-education-levels.action";

interface Options extends EducationLevelFilter {
    query?: string;
}

export const useSearchEducationLevelsForAcademicLevel = () => {
    const [educationLevels, setEducationLevels] = useState<EducationLevel[]>([]);

    const mutation = useMutation({
        mutationFn: (options: Options) => getPagedEducationLevelsActionAsync({ ...options, page: 1, pageSize: 5 }),
    });

    const searchAsync = async (options: Options) => {
        mutation.mutateAsync(options, {
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
