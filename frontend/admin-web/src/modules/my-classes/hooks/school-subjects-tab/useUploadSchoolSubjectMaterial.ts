import { useMutation, useQueryClient } from "@tanstack/react-query";

import { uploadSchoolSubjectMaterialAsync } from "../../api/school-subjects-tab/upload-school-subject-material.api";
import { GET_SCHOOL_SUBJECT_MATERIALS_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";

export const useUploadSchoolSubjectMaterial = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: uploadSchoolSubjectMaterialAsync,
        onSuccess: (_response, variables) => {
            // Invalid cache for useGetSchoolSubjectMaterials
            queryClient.invalidateQueries({
                queryKey: [GET_SCHOOL_SUBJECT_MATERIALS_QUERY_KEY, {
                    academicCycleSchoolGroupId: variables.academicCycleSchoolGroupId,
                    schoolSubjectId: variables.schoolSubjectId,
                }]
            });
        }
    });
}