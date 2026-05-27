import { useMutation, useQueryClient } from "@tanstack/react-query";


import { GET_PAGED_STUDENTS_QUERY_KEY, GET_STUDENT_GENERAL_INFORMATION_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { createUpdateStudentGeneralInformationActionAsync } from "../../actions/students/create-update-student-general-information";

export const useCreateUpdateStudentGeneralInformation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateStudentGeneralInformationActionAsync,
        onSuccess: (response) => {
            // Invalid cache for useQueries
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_STUDENTS_QUERY_KEY] });

            // Set data to query data for created/updated record
            queryClient.setQueryData([GET_STUDENT_GENERAL_INFORMATION_QUERY_KEY, { id: response.id }], response);
        }
    });
}
