import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { StudentFilter } from "@/interfaces/filters/student.filter";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { StudentResponse } from "@/interfaces/responses/student.response";

interface Options extends StudentFilter {
    query?: string;
    page?: number;
    pageSize?: number;
}

export const getPagedStudentsAsync = async ({ query, page = 1, pageSize = 1, fullName, curp, enrollment, email, phoneNumber, isActive }: Options): Promise<PagedResponse<StudentResponse>> => {
    await sleep();

    let endpoint = "/students/paged";

    if (IS_MOCKABLE)
        endpoint = "/students/students/paged-students.json";

    const { data } = await api.get<PagedResponse<StudentResponse>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            fullName,
            curp,
            enrollment,
            email,
            phoneNumber,
            isActive
        }
    });

    return {
        ...data
    };
}
