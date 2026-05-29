import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { StudentGuardian } from "@/interfaces/entites/student-guardian";
import { GET_STUDENT_GUARDIANS_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { createUpdateStudentGuardianForStudentActionAsync } from "../../actions/student-guardians/create-update-student-guardian-for-student";

export const useCreateUpdateStudentGuardianForStudent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateStudentGuardianForStudentActionAsync,
        onSuccess: (response: StudentGuardian) => {
            // Set query data for student guardians list to avoid refetch api
            queryClient.setQueryData([GET_STUDENT_GUARDIANS_QUERY_KEY, { studentId: response.studentId }], (prev: StudentGuardian[] = []) => [...prev.filter(item => item.id !== response.id), response]);
        }
    });
}
