import { useQuery } from "@tanstack/react-query";

import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";
import { GET_SCHOOL_SUBJECT_QUERY_KEY } from "@/lib/queries-key/school-subjects-queries-key";
import { getSchoolSubjectByIdActionAsync } from "../actions/get-school-subject-by-id.action";

interface Options {
    id: string;
}

export const useGetSchoolSubjectById = ({ id }: Options) => {
    return useQuery({
        queryKey: [GET_SCHOOL_SUBJECT_QUERY_KEY, { id }],
        queryFn: () => {
            if (id === "new") {
                return {} as unknown as SchoolSubjectResponse;
            }
            return getSchoolSubjectByIdActionAsync({ id })
        },
        retry: false,
        staleTime: 0,
    });
}
