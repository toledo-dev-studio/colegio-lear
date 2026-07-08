import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_STUDENT_GUARDIANS_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import type { StudentGuardianResponse } from "@/interfaces/responses/student-guardian.response";
import { createUpdateStudentGuardianForStudentActionAsync } from "../../actions/student-guardians/create-update-student-guardian-for-student";

export const useCreateUpdateStudentGuardianForStudent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateStudentGuardianForStudentActionAsync,
        onSuccess: (response: StudentGuardianResponse) => {
            // Set query data to avoid refetch api
            queryClient.setQueryData(
                [GET_STUDENT_GUARDIANS_QUERY_KEY, { studentId: response.studentId }],
                (prev: StudentGuardianResponse[] = []) => {
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
