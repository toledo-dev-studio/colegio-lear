import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { StudentFilter } from "@/interfaces/filters/student.filter";
import type { StudentResponse } from "@/interfaces/responses/student.response";

interface Options extends StudentFilter {
    query?: string;
}

export const getStudentsAsync = async ({ query, fullName, curp, enrollment, email, phoneNumber, isActive }: Options): Promise<StudentResponse[]> => {
    await sleep();

    let endpoint = "/students";

    if (IS_MOCKABLE)
        endpoint = "/students/students/students.json";

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
