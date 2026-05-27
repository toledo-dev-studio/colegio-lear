import { useQuery } from "@tanstack/react-query";

import { GET_STUDENT_MEDICAL_INFORMATION_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { getStudentMedicalInformationByIdActionAsync } from "../../actions/medical-information/get-student-medical-information-by-id.action";

export const useGetByIdStudentMedicalInformation = (id?: string) => {
    return useQuery({
        queryKey: [GET_STUDENT_MEDICAL_INFORMATION_QUERY_KEY, { id }],
        queryFn: () => getStudentMedicalInformationByIdActionAsync(id),
        retry: false,
        staleTime: 0,
    });
}
