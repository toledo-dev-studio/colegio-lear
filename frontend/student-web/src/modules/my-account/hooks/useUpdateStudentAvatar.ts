import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateStudentAvatarAsync } from "../api/update-student-avatar.api";
import { GET_STUDENT_ACCOUNT_QUERY_KEY } from "@/lib/queries-key/students-queries-key";

// Hook para actualizar el avatar del alumno autenticado

export const useUpdateStudentAvatar = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateStudentAvatarAsync,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GET_STUDENT_ACCOUNT_QUERY_KEY] });
        }
    });
}