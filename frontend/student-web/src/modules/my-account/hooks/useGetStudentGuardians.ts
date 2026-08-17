import { useQuery } from "@tanstack/react-query";

import { getStudentGuardiansAsync } from "../api/get-student-guardians.api";
import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_STUDENT_GUARDIANS_QUERY_KEY } from "@/lib/queries-key/students-queries-key";

// Hook para obtener los tutores del alumno autenticado

export const useGetStudentGuardians = () => {
    const queryResult = useQuery({
        queryKey: [GET_STUDENT_GUARDIANS_QUERY_KEY],
        queryFn: getStudentGuardiansAsync,
        staleTime: FIVE_MINUTES_STALE_TIME
    });

    return {
        ...queryResult,
        data: queryResult.data ?? []
    }
}