import { useQuery } from "@tanstack/react-query";

import { GET_STUDENT_ALLERGIES_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { getAllergiesForStudentAsync } from "../../api/student-allergies/get-allergies-for-student.api";

interface Options {
    studentId: string;
}

export const useGetAllergiesForStudent = ({ studentId }: Options) => {
    const queryResult = useQuery({
        queryKey: [GET_STUDENT_ALLERGIES_QUERY_KEY, { studentId }],
        queryFn: () => getAllergiesForStudentAsync({ studentId })
    });

    return {
        ...queryResult,
        data: queryResult.data ?? []
    }
}
