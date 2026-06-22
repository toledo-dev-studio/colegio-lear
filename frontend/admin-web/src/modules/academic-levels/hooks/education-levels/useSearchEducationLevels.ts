import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { EducationLevelFilter } from "@/interfaces/filters/education-level.filter";
import type { EducationLevelResponse } from "@/interfaces/responses/education-level.response";
import { getPagedEducationLevelsActionAsync } from "@/modules/academic-levels/actions/education-levels/get-paged-education-levels.action";

interface Options extends EducationLevelFilter {
    query?: string;
}

export const useSearchEducationLevels = () => {
    const [educationLevels, setEducationLevels] = useState<EducationLevelResponse[]>([]);

    const mutation = useMutation({
        mutationFn: (options: Options) => getPagedEducationLevelsActionAsync({ ...options, page: 1, pageSize: 5 }),
    });

    const searchAsync = async (options: Options) => {
        mutation.mutateAsync(options, {
            onSuccess: (response: PagedResponse<EducationLevelResponse>) => {
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
