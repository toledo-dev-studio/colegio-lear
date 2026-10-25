import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";
import { GET_ACADEMIC_CYCLE_ENROLLMENT_QUERY_KEY, GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { createUpdateAcademicCycleEnrollmentAsync } from "../../api/academic-cycle-enrollments/create-update-academic-cycle-enrollment.api";

export const useCreateUpdateAcademicCycleEnrollment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateAcademicCycleEnrollmentAsync,
        onSuccess: (response: AcademicCycleEnrollmentResponse) => {
            // Invalid cache for useQueries
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY] });

            // Set data to query data for created/updated record
            queryClient.setQueryData([GET_ACADEMIC_CYCLE_ENROLLMENT_QUERY_KEY, { id: response.id }], response);
        }
    });
}
