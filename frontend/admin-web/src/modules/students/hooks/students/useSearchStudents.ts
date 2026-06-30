import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { Student } from "@/interfaces/entites/student";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import { getPagedStudentsActionAsync } from "../../actions/students/get-paged-students.action";

interface Options {
    query?: string;
    isActive?: boolean;
    enrollment?: string;
    fullName?: string;
    status?: boolean,
    academicLevelId?: string;
    educationLevelId?: string;
}

export const useSearchStudents = () => {
    const [students, setStudents] = useState<Student[]>([])

    const mutation = useMutation({
        mutationFn: (options: Options) =>
            getPagedStudentsActionAsync({ ...options, page: 1, pageSize: 5 }),
    });

    const searchAsync = async (options: Options) => {
        mutation.mutateAsync(options, {
            onSuccess: (response: PagedResponse<Student>) => {
                setStudents(response.data);
            },
            onError: () => {
                setStudents([]);
            }
        });
    }

    return {
        students,
        isPending: mutation.isPending,
        searchAsync,
        clearSearchResult: () => setStudents([]),
    }
}
