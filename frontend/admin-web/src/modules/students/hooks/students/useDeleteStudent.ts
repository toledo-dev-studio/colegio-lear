import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteStudentByIdActionAsync } from "../../actions/delete-student-by-id.action";
import { GET_PAGED_STUDENTS_QUERY_KEY, GET_STUDENT_QUERY_KEY } from "@/lib/queries-key/students-queries-key";

export const useDeleteStudent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteStudentByIdActionAsync,
        onSuccess: (id: string) => {
            // Remove query for single query
            queryClient.removeQueries({ queryKey: [GET_STUDENT_QUERY_KEY, { id: id }] });

            // Invalid cache for useQueries, on invalid queries refetch is auto
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_STUDENTS_QUERY_KEY] });
        },
    });
}
