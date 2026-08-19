import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { getAcademicCycleEnrollmentsBySchoolGroupAsync } from "../api/get-academic-cycle-enrollments-by-school-group.api";
import { GET_ACADEMIC_CYCLE_ENROLLMENTS_BY_SCHOOL_GROUP_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";

interface Options {
    academicCycleId?: string;
    academicCycleSchoolGroupId?: string;
}

export const useGetAcademicCycleEnrollmentsBySchoolGroup = ({ academicCycleId, academicCycleSchoolGroupId }: Options) => {
    return useQuery({
        queryKey: [GET_ACADEMIC_CYCLE_ENROLLMENTS_BY_SCHOOL_GROUP_QUERY_KEY, { academicCycleId, academicCycleSchoolGroupId }],
        queryFn: () => getAcademicCycleEnrollmentsBySchoolGroupAsync({
            academicCycleId: academicCycleId!,
            academicCycleSchoolGroupId: academicCycleSchoolGroupId!,
        }),
        enabled: (!!academicCycleId && !!academicCycleSchoolGroupId),
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}