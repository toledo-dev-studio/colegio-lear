import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    studentId: string;
    studentGuardianId: string;
}

export const deleteStudentGuardianByIdForStudentActionAsync = async ({ studentId, studentGuardianId }: Options): Promise<Options> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development")
        return { studentId, studentGuardianId };

    await api.delete(`/students/${studentId}/guardians/${studentGuardianId}`);
    return { studentId, studentGuardianId };
}
