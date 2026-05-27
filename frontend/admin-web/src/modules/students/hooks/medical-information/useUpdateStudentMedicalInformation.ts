import { useMutation, useQueryClient } from "@tanstack/react-query";

import { GET_STUDENT_MEDICAL_INFORMATION_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { updateStudentMedicalInformationActionAsync } from "../../actions/medical-information/update-student-medical-information";

export const useUpdateStudentMedicalInformation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateStudentMedicalInformationActionAsync,
        onSuccess: (response) => {
            // Set data to query data for created/updated record
            queryClient.setQueryData([GET_STUDENT_MEDICAL_INFORMATION_QUERY_KEY, { id: response.id }], response);
        }
    });
}
