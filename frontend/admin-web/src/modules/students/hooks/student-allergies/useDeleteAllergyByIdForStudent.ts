import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AllergyResponse } from "@/interfaces/responses/allergy.response";
import { GET_STUDENT_ALLERGIES_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { deleteAllergyByIForStudentdActionAsync } from "../../actions/student-allergies/delete-allergy-by-id-for-student.action";

export const useDeleteAllergyByIdForStudent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAllergyByIForStudentdActionAsync,
        onSuccess: (response: { id: string, studentId: string }) => {
            // Set query data to avoid refetch api
            queryClient.setQueryData(
                [GET_STUDENT_ALLERGIES_QUERY_KEY, { studentId: response.studentId }],
                (prev: AllergyResponse[] = []) => [...prev.filter(item => item.id !== response.id)]
            );
        },
    });
}
