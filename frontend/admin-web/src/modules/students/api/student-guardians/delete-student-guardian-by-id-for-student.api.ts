import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";

interface Options {
    id: string;
    studentId: string;
}

export const deleteStudentGuardianByIdForStudentAsync = async ({ studentId, id }: Options): Promise<Options> => {
    await sleep();

    if (IS_MOCKABLE)
        return { studentId, id };

    await api.delete(`/students/${studentId}/guardians/${id}`);
    return { studentId, id };
}
