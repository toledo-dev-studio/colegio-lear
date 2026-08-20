import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { getSchoolGroupAssistsAsync } from "../../api/attendance-tab/get-school-group-assists.api";
import { GET_SCHOOL_GROUP_ASSISTS_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";

interface Options {
    academicCycleId?: string;
    schoolGroupId?: string;
    assistDate?: string;
}

export const useGetSchoolGroupAssists = ({ academicCycleId, schoolGroupId, assistDate }: Options) => {
    return useQuery({
        queryKey: [GET_SCHOOL_GROUP_ASSISTS_QUERY_KEY, { academicCycleId, schoolGroupId, assistDate }],
        queryFn: () => getSchoolGroupAssistsAsync({
            academicCycleId: academicCycleId!,
            schoolGroupId: schoolGroupId!,
            assistDate: assistDate!,
        }),
        enabled: (!!academicCycleId && !!schoolGroupId && !!assistDate),
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}