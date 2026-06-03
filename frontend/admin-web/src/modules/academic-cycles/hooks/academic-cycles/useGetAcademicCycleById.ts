import { useQuery } from "@tanstack/react-query";

import { GET_ACADEMIC_CYCLE_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { getAcademicCycleByIdActionAsync } from "../../actions/academic-cycles/get-academic-cycle-by-id.action";

export const useGetAcademicCycleById = (id?: string) => {
    return useQuery({
        queryKey: [GET_ACADEMIC_CYCLE_QUERY_KEY, { id }],
        queryFn: () => getAcademicCycleByIdActionAsync(id),
        retry: false,
        staleTime: 0,
    });
}
