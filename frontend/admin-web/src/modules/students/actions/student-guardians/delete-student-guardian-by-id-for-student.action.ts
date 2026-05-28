import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    studentId: string;
    guardianId: string;
}

export const deleteStudentGuardianByIdForStudentActionAsync = async ({ studentId, guardianId }: Options): Promise<Options> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development")
        return { studentId, guardianId };

    await api.delete(`/students/${studentId}/guardians/${guardianId}`);
    return { studentId, guardianId };
}
