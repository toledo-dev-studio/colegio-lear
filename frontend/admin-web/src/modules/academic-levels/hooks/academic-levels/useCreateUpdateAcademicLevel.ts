import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import { createUpdateAcademicLevelAction } from "../../actions/create-update-academic-level.action";
import { GET_ACADEMIC_LEVEL_QUERY_KEY, GET_PAGED_ACADEMIC_LEVELS_QUERY_KEY } from "@/lib/queries-key/academic-levels-queries-key";

export const useCreateUpdateAcademicLevel = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateAcademicLevelAction,
        onSuccess: (response: AcademicLevel) => {
            // Invalid cache for useQueries
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_ACADEMIC_LEVELS_QUERY_KEY] });

            // Set data to query data for created/updated record
            queryClient.setQueryData([GET_ACADEMIC_LEVEL_QUERY_KEY, { id: response.id }], response);
        }
    });
}