import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const deleteSchoolSubjectByIdActionAsync = async (id: string): Promise<string> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable")
        return id;

    await api.delete(`/school-subjects/${id}`);
    return id;
}
