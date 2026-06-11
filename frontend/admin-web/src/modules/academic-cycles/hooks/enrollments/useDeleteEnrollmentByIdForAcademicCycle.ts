import { useSearchParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { stringToNumberWithDefault } from "@/lib/extensions/datatypes";
import type { StudentEnrollment } from "@/interfaces/entites/student-enrollment";
import { GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import { deleteEnrollmentByIdForAcademicCycleActionAsync } from "../../actions/enrollments/delete-enrollment-by-id-for-academic-cycle";

export const useDeleteEnrollmentByIdForAcademicCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteEnrollmentByIdForAcademicCycleActionAsync,
        onSuccess: (response: { academicCycleId: string; academicCycleSchoolGroupId: string; enrollmentId: string; }) => {
            const [searchParams] = useSearchParams();

            const query = searchParams.get("query")?.trim() || undefined;
            const page = stringToNumberWithDefault(searchParams.get("page"), 1);
            const pageSize = stringToNumberWithDefault(searchParams.get("page-size"), 5);

            // Set query data for academic cycle enrollments list to avoid refetch api
            queryClient.setQueryData(
                [GET_PAGED_ACADEMIC_CYCLE_ENROLLMENTS_QUERY_KEY, { query, page, pageSize, academicCycleId: response.academicCycleId, academicCycleSchoolGroupId: response.academicCycleSchoolGroupId }],
                (prev: StudentEnrollment[] = []) => [...prev.filter(item => item.id !== response.enrollmentId)]
            );
        },
    });
}
