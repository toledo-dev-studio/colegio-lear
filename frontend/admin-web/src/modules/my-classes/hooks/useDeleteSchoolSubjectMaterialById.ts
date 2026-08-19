import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteSchoolSubjectMaterialByIdAsync } from "../api/delete-school-subject-material-by-id.api";
import { GET_SCHOOL_SUBJECT_MATERIALS_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";

export const useDeleteSchoolSubjectMaterialById = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteSchoolSubjectMaterialByIdAsync,
        onSuccess: (response) => {
            // Invalid cache for useGetSchoolSubjectMaterials
            queryClient.invalidateQueries({
                queryKey: [GET_SCHOOL_SUBJECT_MATERIALS_QUERY_KEY, {
                    academicCycleSchoolGroupId: response.academicCycleSchoolGroupId,
                    schoolSubjectId: response.schoolSubjectId,
                }]
            });
        }
    });
}