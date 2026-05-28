import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_STUDENT_GUARDIANS_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { deleteStudentGuardianByIdForStudentActionAsync } from "../../actions/student-guardians/delete-student-guardian-by-id-for-student.action";

export const useDeleteStudentGuardianByIdForStudent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteStudentGuardianByIdForStudentActionAsync,
        onSuccess: (response: { studentId: string, guardianId: string }) => {
            // Invalid cache for useQueries, on invalid queries refetch is auto
            queryClient.invalidateQueries({ queryKey: [GET_STUDENT_GUARDIANS_QUERY_KEY, { studentId: response.studentId }] });
        },
    });
}
