import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import type { AcademicLevelResponse } from "@/interfaces/responses/academic-level.response";
import { GET_ACADEMIC_LEVEL_QUERY_KEY } from "@/lib/queries-key/academic-levels-queries-key";
import { getAcademicLevelByIdAsync } from "../../api/academic-levels/get-academic-level-by-id.api";

interface Options {
    id: string;
}

export const useGetAcademicLevelById = ({ id }: Options) => {
    return useQuery({
        queryKey: [GET_ACADEMIC_LEVEL_QUERY_KEY, { id }],
        queryFn: () => {
            if (id === "new") {
                return {} as unknown as AcademicLevelResponse;
            }
            return getAcademicLevelByIdAsync({ id });
        },
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}
