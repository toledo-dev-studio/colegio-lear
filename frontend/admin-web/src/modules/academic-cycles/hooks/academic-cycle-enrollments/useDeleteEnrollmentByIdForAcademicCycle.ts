import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAcademicCycleEnrollmentByIdAsync } from "../../api/academic-cycle-enrollments/delete-academic-cycle-enrollment-by-id.api";
import { GET_ACADEMIC_CYCLE_ENROLLMENT_QUERY_KEY, GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";

export const useDeleteAcademicCycleEnrollmentById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAcademicCycleEnrollmentByIdAsync,
        onSuccess: ({ id }) => {
            // Remove query for single query
            queryClient.removeQueries({ queryKey: [GET_ACADEMIC_CYCLE_ENROLLMENT_QUERY_KEY, { id: id }] });

            // Invalid cache for useQueries, on invalid queries refetch is auto
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY] });
        },
    });
}
