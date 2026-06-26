import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_ACADEMIC_CYCLE_SCHOOL_GROUP_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import type { AcademicCycleSchoolGroupResponse } from "@/interfaces/responses/academic-cycle-school-group.response";
import { getAcademicCycleSchoolGroupByIdActionAsync } from "../../actions/academic-cycle-school-groups/get-academic-cycle-school-group-by-id.action";

interface Options {
    id: string;
    academicCycleId: string;
}

export const useGetAcademicCycleSchoolGroupById = ({ id, academicCycleId }: Options) => {
    return useQuery({
        queryKey: [GET_ACADEMIC_CYCLE_SCHOOL_GROUP_QUERY_KEY, { id, academicCycleId }],
        queryFn: () => {
            if (id === "new") {
                return {} as unknown as AcademicCycleSchoolGroupResponse;
            }
            return getAcademicCycleSchoolGroupByIdActionAsync({ id, academicCycleId });
        },
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}
