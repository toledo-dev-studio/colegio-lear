import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { PagedResponse } from "@/interfaces/responses/paged.response";
import type { Student } from "@/interfaces/entites/student";

interface Options {
    query?: string;
    page?: number;
    pageSize?: number;
    name?: string;
    curp?: string;
    enrollment?: string;
    email?: string;
    phoneNumber?: string;
    status?: boolean,
}

export const getPagedStudentsActionAsync = async ({ query, page = 1, pageSize = 1, name, curp, enrollment, email, phoneNumber, status }: Options): Promise<PagedResponse<Student>> => {
    await sleep();

    let endpoint = "/students/paged";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/students/paged-students.json";

    // REMOVE
    endpoint = "http://localhost/api/students/students/paged-students.json";

    const { data } = await api.get<PagedResponse<Student>>(endpoint, {
        params: {
            q: query,
            page,
            pageSize,
            name,
            curp,
            enrollment,
            email,
            phoneNumber,
            status,
        }
    });

    return {
        ...data
    };
}
