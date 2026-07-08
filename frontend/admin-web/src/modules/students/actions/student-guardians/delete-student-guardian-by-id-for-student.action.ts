import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    id: string;
    studentId: string;
}

export const deleteStudentGuardianByIdForStudentActionAsync = async ({ studentId, id }: Options): Promise<Options> => {
    await sleep();

    // REMOVE
    if (VITE_ENVIRONMENT === "development")
        return { studentId, id };

    await api.delete(`/students/${studentId}/guardians/${id}`);
    return { studentId, id };
}
