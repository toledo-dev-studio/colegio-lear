import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_STUDENT_GUARDIANS_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import type { StudentGuardianResponse } from "@/interfaces/responses/student-guardian.response";
import { deleteStudentGuardianByIdForStudentActionAsync } from "../../actions/student-guardians/delete-student-guardian-by-id-for-student.action";

export const useDeleteStudentGuardianByIdForStudent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteStudentGuardianByIdForStudentActionAsync,
        onSuccess: (response: { studentId: string, id: string }) => {
            // Set query data to avoid refetch api
            queryClient.setQueryData([GET_STUDENT_GUARDIANS_QUERY_KEY, { studentId: response.studentId }],
                (prev: StudentGuardianResponse[] = []) => [...prev.filter(item => item.id !== response.id)]
            );
        },
    });
}
