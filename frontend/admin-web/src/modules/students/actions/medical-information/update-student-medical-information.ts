import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentMedicalInformation } from "@/interfaces/entites/student-medical-information";

interface Options {
    studentId: string;
    studentMedicalInformationLike: Partial<StudentMedicalInformation>
}

export const updateStudentMedicalInformationActionAsync = async (options: Options): Promise<StudentMedicalInformation> => {
    await sleep();

    const { studentId, studentMedicalInformationLike } = options;

    if (VITE_ENVIRONMENT === "mockable") {
        return studentMedicalInformationLike as StudentMedicalInformation;
    }

    const { data } = await api.patch<StudentMedicalInformation>(`/students/${studentId}/medical-information`, { ...studentMedicalInformationLike });

    return {
        ...data,
    };
}
