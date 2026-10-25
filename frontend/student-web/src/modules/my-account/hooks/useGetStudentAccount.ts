import { useQuery } from "@tanstack/react-query";

import { getStudentAccountAsync } from "../api/get-student-account.api";
import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_STUDENT_ACCOUNT_QUERY_KEY } from "@/lib/queries-key/students-queries-key";

// Hook para obtener los datos personales del alumno autenticado

export const useGetStudentAccount = () => {
    return useQuery({
        queryKey: [GET_STUDENT_ACCOUNT_QUERY_KEY],
        queryFn: getStudentAccountAsync,
        staleTime: FIVE_MINUTES_STALE_TIME
    });
}