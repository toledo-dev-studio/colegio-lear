import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAcademicLevelByIdActionAsync } from "../../actions/academic-levels/delete-academic-level-by-id.action";
import { GET_ACADEMIC_LEVEL_QUERY_KEY, GET_PAGED_ACADEMIC_LEVELS_QUERY_KEY } from "../../../../lib/queries-key/academic-levels-queries-key";

export const useDeleteAcademicLevelById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAcademicLevelByIdActionAsync,
        onSuccess: (id: string) => {
            // Remove query for single query
            queryClient.removeQueries({ queryKey: [GET_ACADEMIC_LEVEL_QUERY_KEY, { id: id }] });

            // Invalid cache for useQueries, on invalid queries refetch is auto
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_ACADEMIC_LEVELS_QUERY_KEY] });
        },
    });
}
