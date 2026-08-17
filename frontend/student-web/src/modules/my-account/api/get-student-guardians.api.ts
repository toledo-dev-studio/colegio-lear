import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { StudentGuardianResponse } from "@/interfaces/responses/student-guardian.response";

// API para obtener los tutores del alumno autenticado

export const getStudentGuardiansAsync = async (): Promise<StudentGuardianResponse[]> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<StudentGuardianResponse[]>("/account/guardians.json");
        return data;
    }

    const { data } = await api.get<StudentGuardianResponse[]>("/students/me/guardians");

    return data;
}