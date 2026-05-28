import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { StudentGuardian } from "@/interfaces/entites/student-guardian";
import { GET_STUDENT_GUARDIANS_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { createUpdateStudentGuardianForStudentActionAsync } from "../../actions/student-guardians/create-update-student-guardian-for-student";

export const useCreateUpdateStudentGuardianForStudent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateStudentGuardianForStudentActionAsync,
        onSuccess: (response: StudentGuardian) => {
            // Invalid cache for useQueries
            queryClient.invalidateQueries({ queryKey: [GET_STUDENT_GUARDIANS_QUERY_KEY, { studentId: response.studentId }] });
        }
    });
}
