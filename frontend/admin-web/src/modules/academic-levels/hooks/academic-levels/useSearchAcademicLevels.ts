import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { AcademicLevelFilter } from "@/interfaces/filters/academic-level.filter";
import type { AcademicLevelResponse } from "@/interfaces/responses/academic-level.response";
import { getPagedAcademicLevelsAsync } from "@/modules/academic-levels/api/academic-levels/get-paged-academic-levels.api";

interface Options extends AcademicLevelFilter {
    query?: string;
}

export const useSearchAcademicLevels = () => {
    const [academicLevels, setAcademicLevels] = useState<AcademicLevelResponse[]>([])

    const mutation = useMutation({
        mutationFn: (options: Options) => getPagedAcademicLevelsAsync({ ...options, page: 1, pageSize: 5 }),
    });

    const searchAsync = async (options: Options) => {
        mutation.mutateAsync(options, {
            onSuccess: (response: PagedResponse<AcademicLevelResponse>) => {
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
