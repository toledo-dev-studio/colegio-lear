import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";

interface Options {
    id: string;
    studentId: string;
}

export const deleteAllergyByIForStudentdAsync = async ({ id, studentId }: Options): Promise<Options> => {
    await sleep();

    if (IS_MOCKABLE)
        return { studentId, id };

    await api.delete(`/students/${studentId}/allergies/${id}`);
    return { studentId, id };
}
