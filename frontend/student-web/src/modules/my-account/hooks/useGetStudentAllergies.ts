import { useQuery } from "@tanstack/react-query";

import { getStudentAllergiesAsync } from "../api/get-student-allergies.api";
import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_STUDENT_ALLERGIES_QUERY_KEY } from "@/lib/queries-key/students-queries-key";

// Hook para obtener las alergias del alumno autenticado

export const useGetStudentAllergies = () => {
    const queryResult = useQuery({
        queryKey: [GET_STUDENT_ALLERGIES_QUERY_KEY],
        queryFn: getStudentAllergiesAsync,
        staleTime: FIVE_MINUTES_STALE_TIME
    });

    return {
        ...queryResult,
        data: queryResult.data ?? []
    }
}