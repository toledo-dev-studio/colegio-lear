import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { getSchoolSubjectGradesAsync } from "../api/get-school-subject-grades.api";
import { GET_SCHOOL_SUBJECT_GRADES_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";

interface Options {
    academicCycleSchoolGroupId?: string;
    schoolSubjectId?: string;
}

export const useGetSchoolSubjectGrades = ({ academicCycleSchoolGroupId, schoolSubjectId }: Options) => {
    return useQuery({
        queryKey: [GET_SCHOOL_SUBJECT_GRADES_QUERY_KEY, { academicCycleSchoolGroupId, schoolSubjectId }],
        queryFn: () => getSchoolSubjectGradesAsync({
            academicCycleSchoolGroupId: academicCycleSchoolGroupId!,
            schoolSubjectId: schoolSubjectId!,
        }),
        enabled: (!!academicCycleSchoolGroupId && !!schoolSubjectId),
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}