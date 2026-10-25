import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { getSchoolSubjectTasksAsync } from "../../api/school-subjects-tab/get-school-subject-tasks.api";
import { GET_SCHOOL_SUBJECT_TASKS_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";

interface Options {
    academicCycleSchoolGroupId?: string;
    schoolSubjectId?: string;
}

export const useGetSchoolSubjectTasks = ({ academicCycleSchoolGroupId, schoolSubjectId }: Options) => {
    return useQuery({
        queryKey: [GET_SCHOOL_SUBJECT_TASKS_QUERY_KEY, { academicCycleSchoolGroupId, schoolSubjectId }],
        queryFn: () => getSchoolSubjectTasksAsync({
            academicCycleSchoolGroupId: academicCycleSchoolGroupId!,
            schoolSubjectId: schoolSubjectId!,
        }),
        enabled: (!!academicCycleSchoolGroupId && !!schoolSubjectId),
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}