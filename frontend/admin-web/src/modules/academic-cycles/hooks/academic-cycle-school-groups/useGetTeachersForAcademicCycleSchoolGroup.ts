

import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_ACADEMIC_CYCLE_SCHOOL_GROUP_CALENDARS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { getTeachersForAcademicCycleSchoolGroupAsync } from "../../api/academic-cycle-school-groups/get-teachers-for-academic-cycle-school-group.api";

interface Options {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
}

export const useGetTeachersForAcademicCycleSchoolGroup = ({ academicCycleId, academicCycleSchoolGroupId }: Options) => {
    const queryResult = useQuery({
        queryKey: [GET_ACADEMIC_CYCLE_SCHOOL_GROUP_CALENDARS_QUERY_KEY, { academicCycleId, academicCycleSchoolGroupId }],
        queryFn: () => getTeachersForAcademicCycleSchoolGroupAsync({ academicCycleId, academicCycleSchoolGroupId }),
        staleTime: FIVE_MINUTES_STALE_TIME,
        enabled: (!!academicCycleId && !!academicCycleSchoolGroupId)
    });

    return {
        ...queryResult,
        data: queryResult.data ?? []
    }
}
