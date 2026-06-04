import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { SchoolSubject } from "@/interfaces/entites/school-subject";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import { getPagedSchoolSubjectsActionAsync } from "../actions/get-paged-school-subjects.action";

interface Options {
    query?: string;
    name?: string;
    status?: boolean,
    academicLevelId?: string;
    educationLevelId?: string;
}

export const useSearchSchoolSubjects = () => {
    const [schoolSubjects, setSchoolSubjects] = useState<SchoolSubject[]>([])

    const mutation = useMutation({
        mutationFn: (options: Options) => 
            getPagedSchoolSubjectsActionAsync({ ...options, page: 1, pageSize: 5 }),
    });

    const searchAsync = async (options: Options) => {
        mutation.mutateAsync(options, {
            onSuccess: (response: PagedResponse<SchoolSubject>) => {
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
