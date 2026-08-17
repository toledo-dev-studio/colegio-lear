import { useInfiniteQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_SCHOOL_SUBJECT_TASKS_QUERY_KEY } from "@/lib/queries-key/subjects-queries-key";
import { getSchoolSubjectTasksAsync, SCHOOL_SUBJECT_TASKS_PAGE_SIZE } from "../api/get-school-subject-tasks.api";

interface Options {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
    academicCycleSchoolSubjectId: string;
}

export const getSchoolSubjectTasksQueryKey = ({ academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId }: Options) =>
    [GET_SCHOOL_SUBJECT_TASKS_QUERY_KEY, { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId, pageSize: SCHOOL_SUBJECT_TASKS_PAGE_SIZE }];

export const useGetSchoolSubjectTasks = ({ academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId }: Options) => {
    const queryResult = useInfiniteQuery({
        queryKey: getSchoolSubjectTasksQueryKey({ academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId }),
        queryFn: ({ pageParam }) =>
            getSchoolSubjectTasksAsync({
                academicCycleId,
                academicCycleSchoolGroupId,
                academicCycleSchoolSubjectId,
                page: pageParam,
                pageSize: SCHOOL_SUBJECT_TASKS_PAGE_SIZE,
            }),
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
        enabled: !!academicCycleId && !!academicCycleSchoolGroupId && !!academicCycleSchoolSubjectId,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });

    const tasks = (queryResult.data?.pages ?? []).flatMap((page) => page.data);

    return { ...queryResult, data: tasks };
}
