import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { deleteEnrollmentByIdForAcademicCycleActionAsync } from "../../actions/enrollments/delete-enrollment-by-id-for-academic-cycle";

export const useDeleteEnrollmentByIdForAcademicCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteEnrollmentByIdForAcademicCycleActionAsync,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: [GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY]});
        },
    });
}
