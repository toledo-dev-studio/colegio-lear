import { useQuery } from "@tanstack/react-query";

import type { AcademicLevelResponse } from "@/interfaces/responses/academic-level.response";
import { GET_ACADEMIC_LEVEL_QUERY_KEY } from "@/lib/queries-key/academic-levels-queries-key";
import { getAcademicLevelByIdActionAsync } from "../../actions/academic-levels/get-academic-level-by-id.action";

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
            return getAcademicLevelByIdActionAsync({ id });
        },
        retry: false,
        staleTime: 0,
    });
}
