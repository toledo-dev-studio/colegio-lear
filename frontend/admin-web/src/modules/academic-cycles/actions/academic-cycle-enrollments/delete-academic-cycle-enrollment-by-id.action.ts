import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

interface Options {
    id: string;
    academicCycleId: string;
}

export const deleteAcademicCycleEnrollmentByIdActionAsync = async ({ id, academicCycleId }: Options): Promise<Options> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable")
        return { id, academicCycleId };

    await api.delete(`/academic-cycles/${academicCycleId}/enrollments/${id}`);
    return { id, academicCycleId };
}
