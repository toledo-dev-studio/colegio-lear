import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";

export const deleteSchoolSubjectByIdActionAsync = async (id: string): Promise<void> => {
    await sleep();

    await api.delete(`/school-subjects/${id}`);
}