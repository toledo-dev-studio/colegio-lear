import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Student } from "@/interfaces/entites/student";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    query?: string;
    name?: string;
    curp?: string;
    enrollment?: string;
    email?: string;
    phoneNumber?: string;
    status?: boolean
}

export const getStudentsActionAsync = async ({ query, name, curp, enrollment, email, phoneNumber, status }: Options): Promise<Student[]> => {
    await sleep();

    let endpoint = "/students";

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/students/students.json";

    endpoint = "http://localhost/api/students/students.json";

    const { data } = await api.get<Student[]>(endpoint, {
        params: {
            q: query,
            name,
            curp,
            enrollment,
            email,
            phoneNumber,
            status
        }
    });

    return data;
}
