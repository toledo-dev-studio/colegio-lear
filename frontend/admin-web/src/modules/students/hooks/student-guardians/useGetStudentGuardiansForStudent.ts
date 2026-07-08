import { useQuery } from "@tanstack/react-query";

import { GET_STUDENT_GUARDIANS_QUERY_KEY } from "@/lib/queries-key/students-queries-key";
import { getStudentGuardiansForStudentActionAsync } from "../../actions/student-guardians/get-student-guardians-for-student.action";

interface Options {
    studentId: string;
}

export const useGetStudentGuardiansForStudent = ({ studentId }: Options) => {
    const query = useQuery({
        queryKey: [GET_STUDENT_GUARDIANS_QUERY_KEY, { studentId }],
        queryFn: () => getStudentGuardiansForStudentActionAsync({ studentId }),
    });

    return {
        ...query,
        data: query.data ?? []
    }
}
