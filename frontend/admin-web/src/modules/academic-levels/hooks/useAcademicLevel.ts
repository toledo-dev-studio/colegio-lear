import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getAcademicLevelByIdAction } from "../actions/get-academic-level-by-id.action";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import { createUpdateAcademicLevelAction } from "../actions/create-update-academic-level.action";
import { GET_ACADEMIC_LEVEL_QUERY_KEY, GET_ACADEMIC_LEVELS_QUERY_KEY, GET_PAGED_ACADEMIC_LEVELS_QUERY_KEY } from "../lib/queries-key";

export const useAcademicLevel = (id: string) => {

    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: [GET_ACADEMIC_LEVEL_QUERY_KEY, { id }],
        queryFn: () => getAcademicLevelByIdAction(id),
        retry: false,
        staleTime: 0,
    });

    const mutation = useMutation({
        mutationFn: createUpdateAcademicLevelAction,
        onSuccess: (AcademicLevel: AcademicLevel) => {
            // Invalidar cache de useQuery de consulta de todos los niveles académicos
            queryClient.invalidateQueries({ queryKey: [GET_ACADEMIC_LEVELS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_ACADEMIC_LEVELS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_ACADEMIC_LEVEL_QUERY_KEY, { id: AcademicLevel.id }] });

            // Actualizar query data
            queryClient.setQueryData([GET_ACADEMIC_LEVEL_QUERY_KEY, { id: AcademicLevel.id }], AcademicLevel);
        },
        onError: (error) => {
            return error
        }
    });

    return {
        ...query,
        mutation,
    }
}
