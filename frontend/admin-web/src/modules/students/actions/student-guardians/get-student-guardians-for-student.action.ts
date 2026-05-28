import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentGuardian } from "@/interfaces/entites/student-guardian";

interface Options {
    studentId?: string;
}

export const getStudentGuardiansForStudentActionAsync = async ({ studentId }: Options): Promise<StudentGuardian[]> => {
    await sleep();

    if (!studentId)
        throw new Error("El identificador del registro es requerido");

    let endpoint = `/students/${studentId}/guardians`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/students/student-guardians/student-guardians.json";

    // REMOVE
    endpoint = "http://localhost/api/students/student-guardians/student-guardians.json";

    const { data } = await api.get<StudentGuardian[]>(endpoint);

    return data;
}
