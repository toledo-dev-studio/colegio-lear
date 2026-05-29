import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_STUDENT_GUARDIANS_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { deleteStudentGuardianByIdForStudentActionAsync } from "../../actions/student-guardians/delete-student-guardian-by-id-for-student.action";
import type { StudentGuardian } from "@/interfaces/entites/student-guardian";

export const useDeleteStudentGuardianByIdForStudent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteStudentGuardianByIdForStudentActionAsync,
        onSuccess: (response: { studentId: string, studentGuardianId: string }) => {
            // Set query data for student guardians list to avoid refetch api
            queryClient.setQueryData([GET_STUDENT_GUARDIANS_QUERY_KEY, { studentId: response.studentId }], (prev: StudentGuardian[] = []) => [...prev.filter(item => item.id !== response.studentGuardianId)]);
        },
    });
}
