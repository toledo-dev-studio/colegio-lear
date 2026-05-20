import { useQuery } from "@tanstack/react-query";

import { SINGLE_RECORD_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_SCHOOL_SUBJECT_QUERY_KEY } from "@/lib/queries-key/school-subjects-queries-key";
import { getSchoolSubjectByIdActionAsync } from "../../actions/get-school-subject-by-id.action";

export const useGetByIdSchoolSubject = (id?: string, enabledQuery: boolean = true, staleTime = SINGLE_RECORD_STALE_TIME) => {
    return useQuery({
        queryKey: [GET_SCHOOL_SUBJECT_QUERY_KEY, { id }],
        queryFn: () => getSchoolSubjectByIdActionAsync(id),
        retry: false,
        staleTime: staleTime,
        enabled: enabledQuery
    });
}
