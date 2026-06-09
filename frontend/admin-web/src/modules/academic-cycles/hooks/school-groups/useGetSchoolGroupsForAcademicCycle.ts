import { useQuery } from "@tanstack/react-query";

import { GET_ACADEMIC_CYCLE_SCHOOL_GROUPS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { getSchoolGroupsForAcademicCycleActionAsync } from "../../actions/school-groups/get-school-groups-for-academic-cycle";

export const useGetSchoolGroupsForAcademicCycle = (academicCycleId: string) => {
    const query = useQuery({
        queryKey: [GET_ACADEMIC_CYCLE_SCHOOL_GROUPS_QUERY_KEY, { academicCycleId: academicCycleId }],
        queryFn: () => getSchoolGroupsForAcademicCycleActionAsync({ academicCycleId }),
    });

    return {
        ...query,
        data: query.data ?? []
    }
}
