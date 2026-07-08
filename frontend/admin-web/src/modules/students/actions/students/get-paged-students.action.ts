import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentFilter } from "@/interfaces/filters/student.filter";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { StudentResponse } from "@/interfaces/responses/student.response";

interface Options extends StudentFilter {
    query?: string;
    page?: number;
    pageSize?: number;
}

export const getPagedStudentsActionAsync = async ({ query, page = 1, pageSize = 1, fullName, curp, enrollment, email, phoneNumber, isActive }: Options): Promise<PagedResponse<StudentResponse>> => {
    await sleep();

    let endpoint = "/students/paged";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/students/paged-students.json";

    // REMOVE
    endpoint = "http://localhost/api/students/students/paged-students.json";

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
