import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentFilter } from "@/interfaces/filters/student.filter";
import type { StudentResponse } from "@/interfaces/responses/student.response";

interface Options extends StudentFilter {
    query?: string;
}

export const getStudentsActionAsync = async ({ query, fullName, curp, enrollment, email, phoneNumber, isActive }: Options): Promise<StudentResponse[]> => {
    await sleep();

    let endpoint = "/students";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/students/students.json";

    const { data } = await api.get<StudentResponse[]>(endpoint, {
        params: {
            q: query,
            fullName,
            curp,
            enrollment,
            email,
            phoneNumber,
            isActive
        }
    });

    return data;
}
