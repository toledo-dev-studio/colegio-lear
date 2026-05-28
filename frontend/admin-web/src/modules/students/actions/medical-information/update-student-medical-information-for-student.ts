import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentMedicalInformation } from "@/interfaces/entites/student-medical-information";

interface Options {
    studentId: string;
    studentMedicalInformationLike: Partial<StudentMedicalInformation>
}

export const updateStudentMedicalInformationForStudentActionAsync = async ({ studentId, studentMedicalInformationLike }: Options): Promise<StudentMedicalInformation> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development") {
        return studentMedicalInformationLike as StudentMedicalInformation;
    }

    const { data } = await api.patch<StudentMedicalInformation>(`/students/${studentId}/medical-information`, { ...studentMedicalInformationLike });

    return {
        ...data,
    };
}
