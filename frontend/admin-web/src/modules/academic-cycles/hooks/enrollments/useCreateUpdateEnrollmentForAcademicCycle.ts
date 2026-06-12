import { useSearchParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { stringToNumberWithDefault } from "@/lib/extensions/datatypes";
import type { AcademicCycleSchoolGroupEnrollment } from "@/interfaces/entites/academic-cycle-school-group-enrollment";
import { GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { createUpdateEnrollmentForAcademicCycleActionAsync } from "../../actions/enrollments/create-update-enrollment-for-academic-cycle";

export const useCreateUpdateEnrollmentForAcademicCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateEnrollmentForAcademicCycleActionAsync,
        onSuccess: (response: AcademicCycleSchoolGroupEnrollment) => {
            const [searchParams] = useSearchParams();

            const query = searchParams.get("query")?.trim() || undefined;
            const page = stringToNumberWithDefault(searchParams.get("page"), 1);
            const pageSize = stringToNumberWithDefault(searchParams.get("page-size"), 5);

            // Set query data for academic cycle enrollments list to avoid refetch api
            queryClient.setQueryData(
                [GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY, { query, page, pageSize, academicCycleId: response.academicCycleId, academicCycleSchoolGroupId: response.academicCycleSchoolGroupId }],
                (prev: AcademicCycleSchoolGroupEnrollment[] = []) => {
                    const index = prev.findIndex(item => item.id === response.id);
                    if (index === -1)
                        return [...prev, response]
                    prev[index] = response;
                    return prev;
                }
            );
        }
    });
}
