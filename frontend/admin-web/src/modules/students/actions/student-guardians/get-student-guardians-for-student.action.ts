import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentGuardianResponse } from "@/interfaces/responses/student-guardian.response";

interface Options {
    studentId: string;
}

export const getStudentGuardiansForStudentActionAsync = async ({ studentId }: Options): Promise<StudentGuardianResponse[]> => {
    await sleep();

    let endpoint = `/students/${studentId}/guardians`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/students/student-guardians/student-guardians.json";

    // REMOVE
    endpoint = "http://localhost/api/students/student-guardians/student-guardians.json";

    const { data } = await api.get<StudentGuardianResponse[]>(endpoint);

    return data;
}
