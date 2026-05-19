import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAcademicLevelByIdActionAsync } from "../actions/delete-academic-level-by-id.action";
import { GET_ACADEMIC_LEVELS_QUERY_KEY, GET_PAGED_ACADEMIC_LEVELS_QUERY_KEY } from "../../../lib/queries-key/academic-levels-queries-key";

export const useDeleteAcademicLevel = () => {

    const queryClient = useQueryClient();

    const deleteAcademicLevel = useMutation({
        mutationFn: deleteAcademicLevelByIdActionAsync,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [GET_ACADEMIC_LEVELS_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_ACADEMIC_LEVELS_QUERY_KEY] });

            queryClient.refetchQueries({ queryKey: [GET_PAGED_ACADEMIC_LEVELS_QUERY_KEY] })
        },
    })

    return {
        deleteAcademicLevel
    }
}
