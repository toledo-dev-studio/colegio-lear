import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { StudentResponse } from "@/interfaces/responses/student.response";
import { getPagedStudentsActionAsync } from "../../actions/students/get-paged-students.action";
import type { StudentFilter } from "@/interfaces/filters/student.filter";

interface Options extends StudentFilter {
    query?: string;
}

export const useSearchStudents = () => {
    const [students, setStudents] = useState<StudentResponse[]>([])

    const mutation = useMutation({
        mutationFn: (options: Options) =>
            getPagedStudentsActionAsync({ ...options, page: 1, pageSize: 5 }),
    });

    const searchAsync = async (options: Options) => {
        mutation.mutateAsync(options, {
            onSuccess: (response: PagedResponse<StudentResponse>) => {
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
