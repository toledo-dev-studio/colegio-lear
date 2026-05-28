import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentMedicalInformation } from "@/interfaces/entites/student-medical-information";

interface Options {
    studentId?: string;
}

export const getStudentMedicalInformationForStudentActionAsync = async ({ studentId }: Options): Promise<StudentMedicalInformation> => {
    await sleep();

    if (!studentId)
        throw new Error("El identificador del registro es requerido");

    let endpoint = `/students/${studentId}/medical-information`;

    if (VITE_ENVIRONMENT === "development")
        endpoint = "/students/medical-information/medical-information.json";

    // REMOVE
    endpoint = "http://localhost/api/students/medical-information/medical-information.json";

    const { data } = await api.get<StudentMedicalInformation>(endpoint);

    return data;
}
