import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAcademicCycleByIdActionAsync } from "../../actions/academic-cycles/delete-academic-cycle-by-id.action";
import { GET_ACADEMIC_CYCLE_QUERY_KEY, GET_PAGED_ACADEMIC_CYCLES_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";

export const useDeleteAcademicCycleById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteAcademicCycleByIdActionAsync,
        onSuccess: (id: string) => {
            // Remove query for single query
            queryClient.removeQueries({ queryKey: [GET_ACADEMIC_CYCLE_QUERY_KEY, { id: id }] });

            // Invalid cache for useQueries, on invalid queries refetch is auto
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_ACADEMIC_CYCLES_QUERY_KEY] });
        },
    });
}
