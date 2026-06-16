import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { createUpdateEnrollmentForAcademicCycleActionAsync } from "../../actions/enrollments/create-update-enrollment-for-academic-cycle";

export const useCreateUpdateEnrollmentForAcademicCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateEnrollmentForAcademicCycleActionAsync,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY] });
        }
    });
}
