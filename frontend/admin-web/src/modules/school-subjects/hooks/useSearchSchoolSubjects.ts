import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";
import { getPagedSchoolSubjectsAsync } from "../api/get-paged-school-subjects.api";
import type { SchoolSubjectFilter } from "@/interfaces/filters/school-subject.filter";

interface Options extends SchoolSubjectFilter {
    query?: string;
}

export const useSearchSchoolSubjects = () => {
    const [schoolSubjects, setSchoolSubjects] = useState<SchoolSubjectResponse[]>([])

    const mutation = useMutation({
        mutationFn: (options: Options) =>
            getPagedSchoolSubjectsAsync({ ...options, page: 1, pageSize: 5 }),
    });

    const searchAsync = async (options: Options) => {
        mutation.mutateAsync(options, {
            onSuccess: (response: PagedResponse<SchoolSubjectResponse>) => {
                setSchoolSubjects(response.data);
            },
            onError: () => {
                setSchoolSubjects([]);
            }
        });
    }

    return {
        schoolSubjects,
        isPending: mutation.isPending,
        searchAsync,
        clearSearchResult: () => setSchoolSubjects([]),
    }
}
