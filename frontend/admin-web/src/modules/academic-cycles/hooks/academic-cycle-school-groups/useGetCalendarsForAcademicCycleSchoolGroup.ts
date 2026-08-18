

import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_ACADEMIC_CYCLE_SCHOOL_GROUP_CALENDARS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { getCalendarsForAcademicCycleSchoolGroupAsync } from "../../api/academic-cycle-school-groups/get-calendars-for-academic-cycle-school-group.api";

interface Options {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
}

export const useGetCalendarsForAcademicCycleSchoolGroup = ({ academicCycleId, academicCycleSchoolGroupId }: Options) => {
    const queryResult = useQuery({
        queryKey: [GET_ACADEMIC_CYCLE_SCHOOL_GROUP_CALENDARS_QUERY_KEY, { academicCycleId, academicCycleSchoolGroupId }],
        queryFn: () => getCalendarsForAcademicCycleSchoolGroupAsync({ academicCycleId, academicCycleSchoolGroupId }),
        staleTime: FIVE_MINUTES_STALE_TIME,
        enabled: (!!academicCycleId && !!academicCycleSchoolGroupId)
    });

    return {
        ...queryResult,
        data: queryResult.data ?? []
    }
}
