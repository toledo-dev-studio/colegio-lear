import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import type { AcademicCycleResponse } from "@/interfaces/responses/academic-cycle.response";
import { GET_ACADEMIC_CYCLE_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { getAcademicCycleByIdActionAsync } from "../../actions/academic-cycles/get-academic-cycle-by-id.action";

interface Options {
    id: string;
}

export const useGetAcademicCycleById = ({ id }: Options) => {
    return useQuery({
        queryKey: [GET_ACADEMIC_CYCLE_QUERY_KEY, { id }],
        queryFn: () => {
            if (id === "new") {
                return {} as unknown as AcademicCycleResponse;
            }
            return getAcademicCycleByIdActionAsync({ id })
        },
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}
