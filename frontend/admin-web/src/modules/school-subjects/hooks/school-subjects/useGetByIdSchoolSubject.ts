import { useQuery } from "@tanstack/react-query";

import { GET_SCHOOL_SUBJECT_QUERY_KEY } from "@/lib/queries-key/school-subjects-queries-key";
import { getSchoolSubjectByIdActionAsync } from "../../actions/get-school-subject-by-id.action";

export const useGetByIdSchoolSubject = (id?: string) => {
    return useQuery({
        queryKey: [GET_SCHOOL_SUBJECT_QUERY_KEY, { id }],
        queryFn: () => getSchoolSubjectByIdActionAsync(id),
        retry: false,
        staleTime: 0,
    });
}
