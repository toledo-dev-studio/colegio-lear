import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { AllergyResponse } from "@/interfaces/responses/allergy.response";
import { GET_STUDENT_ALLERGIES_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { createUpdateAllergyForStudentAsync } from "../../api/student-allergies/create-update-allergy-for-student.api";

export const useCreateUpdateAllergyForStudent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateAllergyForStudentAsync,
        onSuccess: (response: AllergyResponse) => {
            // Set data to query data for created/updated record
            queryClient.setQueryData(
                [GET_STUDENT_ALLERGIES_QUERY_KEY, { studentId: response.studentId }],
                (prev: AllergyResponse[] = []) => {
                    const index = prev.findIndex(item => item.id === response.id);
                    if (index === -1)
                        return [...prev, response]
                    prev[index] = response;
                    return [...prev];
                }
            );
        }
    });
}
