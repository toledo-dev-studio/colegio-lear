import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";
import { createUpdateSchoolSubjectAsync } from "../api/create-update-school-subject.api";
import { GET_PAGED_SCHOOL_SUBJECTS_QUERY_KEY, GET_SCHOOL_SUBJECT_QUERY_KEY } from "@/lib/queries-key/school-subjects-queries-key";

export const useCreateUpdateSchoolSubject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createUpdateSchoolSubjectAsync,
        onSuccess: (response: SchoolSubjectResponse) => {
            // Invalid cache for useQueries
            queryClient.invalidateQueries({ queryKey: [GET_PAGED_SCHOOL_SUBJECTS_QUERY_KEY] });

            // Set data to query data for created/updated record
            queryClient.setQueryData([GET_SCHOOL_SUBJECT_QUERY_KEY, { id: response.id }], response);
        }
    });
}
