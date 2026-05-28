import { useQuery } from "@tanstack/react-query";

import { GET_STUDENT_MEDICAL_INFORMATION_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { getStudentMedicalInformationForStudentActionAsync } from "../../actions/medical-information/get-student-medical-information-for-student.action";

export const useGetStudentMedicalInformationForStudent = (studentId?: string) => {
    const query = useQuery({
        queryKey: [GET_STUDENT_MEDICAL_INFORMATION_QUERY_KEY, { studentId }],
        queryFn: () => getStudentMedicalInformationForStudentActionAsync({ studentId })
    });
    return {
        ...query,
        data: {
            ...query.data,
            allergies: query.data?.allergies ?? []
        }
    }
}
