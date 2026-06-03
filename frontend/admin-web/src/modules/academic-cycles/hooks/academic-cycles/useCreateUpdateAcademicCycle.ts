import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createUpdateAcademicCycleActionAsync } from "../../actions/academic-cycles/create-update-academic-cycle";
import { GET_ACADEMIC_CYCLE_QUERY_KEY, GET_PAGED_ACADEMIC_CYCLES_QUERY_KEY } from "@/lib/queries-key/academic-cycles-queries-key";
import type { AcademicCycle } from "@/interfaces/entites/academic-cycle";

export const useCreateUpdateAcademicCycle = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateAcademicCycleActionAsync,
        onSuccess: (response) => {
            // Invalid cache for useQueries
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_ACADEMIC_CYCLES_QUERY_KEY] });

            // Set data to query data for created/updated record
            queryClient.setQueryData([GET_ACADEMIC_CYCLE_QUERY_KEY, { id: response.id }], (prev: AcademicCycle) => {
                return {
                    ...prev,
                    ...response
                }
            });
        }
    });
}
