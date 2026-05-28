import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { StudentMedicalInformation } from "@/interfaces/entites/student-medical-information";
import { GET_STUDENT_MEDICAL_INFORMATION_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { updateStudentMedicalInformationForStudentActionAsync } from "../../actions/medical-information/update-student-medical-information-for-student";

export const useUpdateStudentMedicalInformationForStudent = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateStudentMedicalInformationForStudentActionAsync,
        onSuccess: (response: StudentMedicalInformation) => {
            // Set data to query data for created/updated record
            queryClient.setQueryData([GET_STUDENT_MEDICAL_INFORMATION_QUERY_KEY, { studentId: response.studentId }], response);
        }
    });
}
