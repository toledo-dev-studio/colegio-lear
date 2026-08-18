import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_STUDENT_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import type { StudentResponse } from "@/interfaces/responses/student.response";
import { getStudentByIdAsync } from "../../api/students/get-student-by-id.api";

interface Options {
    id: string;
}

export const useGetStudentById = ({ id }: Options) => {
    return useQuery({
        queryKey: [GET_STUDENT_QUERY_KEY, { id }],
        queryFn: () => {
            if (id === "new") {
                return {} as unknown as StudentResponse
            }
            return getStudentByIdAsync({ id });
        },
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}
