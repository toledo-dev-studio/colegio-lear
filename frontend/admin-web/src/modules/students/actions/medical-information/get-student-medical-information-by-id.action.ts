import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentMedicalInformation } from "@/interfaces/entites/student-medical-information";

export const getStudentMedicalInformationByIdActionAsync = async (id?: string): Promise<StudentMedicalInformation> => {
    await sleep();

    if (!id)
        throw new Error("El identificador del registro es requerido");

    let endpoint = `/students/${id}/medical-information`;

    if (VITE_ENVIRONMENT === "development")
        endpoint = "/students/medical-information/medical-information.json";

    endpoint = "http://localhost/api/students/medical-information/medical-information.json";

    const { data } = await api.get<StudentMedicalInformation>(endpoint);

    return data;
}
