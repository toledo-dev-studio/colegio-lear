import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { StudentResponse } from "@/interfaces/responses/student.response";

// API para obtener los datos personales del alumno autenticado

export const getStudentAccountAsync = async (): Promise<StudentResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<StudentResponse>("/account/student-account.json");
        return data;
    }

    const { data } = await api.get<StudentResponse>("/students/me");

    return data;
}