import { useQuery } from "@tanstack/react-query";

import { GET_STUDENT_ALLERGIES_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { getAllergiesForStudentActionAsync } from "../../actions/student-allergies/get-allergies-for-student.action.action";

interface Options {
    studentId: string;
}

export const useGetAllergiesForStudent = ({ studentId }: Options) => {
    const queryResult = useQuery({
        queryKey: [GET_STUDENT_ALLERGIES_QUERY_KEY, { studentId }],
        queryFn: () => getAllergiesForStudentActionAsync({ studentId })
    });

    return {
        ...queryResult,
        data: queryResult.data ?? []
    }
}
