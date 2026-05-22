import { useQuery } from "@tanstack/react-query";

import { getAcademicLevelByIdAction } from "../actions/get-academic-level-by-id.action";
import { GET_ACADEMIC_LEVEL_QUERY_KEY } from "@/lib/queries-key/academic-levels-queries-key";

export const useGetByIdAcademicLevel = (id?: string) => {
    return useQuery({
        queryKey: [GET_ACADEMIC_LEVEL_QUERY_KEY, { id }],
        queryFn: () => getAcademicLevelByIdAction(id),
        retry: false,
        staleTime: 0,
    });
}
