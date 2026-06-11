import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { StudentEnrollment } from "@/interfaces/entites/student-enrollment";
import { GET_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { createUpdateEnrollmentForAcademicCycleActionAsync } from "../../actions/enrollments/create-update-enrollment-for-academic-cycle";

export const useCreateUpdateEnrollmentForAcademicCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateEnrollmentForAcademicCycleActionAsync,
        onSuccess: (response: StudentEnrollment) => {
            // Set query data for academic cycle enrollments list to avoid refetch api
            queryClient.setQueryData(
                [GET_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY, { academicCycleId: response.academicCycleId, academicCycleSchoolGroupId: response.academicCycleSchoolGroupId }], 
                (prev: StudentEnrollment[] = []) => {
                    const index = prev.findIndex(item => item.id === response.id);
                    if(index === -1)
                        return [...prev, response]
                    prev[index] = response;
                    return prev;
                }
            );
        }
    });
}
