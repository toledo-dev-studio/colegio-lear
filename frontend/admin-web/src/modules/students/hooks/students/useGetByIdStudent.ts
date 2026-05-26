import { useQuery } from "@tanstack/react-query";

import { GET_STUDENT_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { getStudentByIdActionAsync } from "../../actions/get-student-by-id.action";

export const useGetByIdStudent = (id?: string) => {
    return useQuery({
        queryKey: [GET_STUDENT_QUERY_KEY, { id }],
        queryFn: () => getStudentByIdActionAsync(id),
        retry: false,
        staleTime: 0,
    });
}
