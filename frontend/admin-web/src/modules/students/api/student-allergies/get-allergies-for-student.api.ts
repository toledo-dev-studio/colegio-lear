import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AllergyResponse } from "@/interfaces/responses/allergy.response";

interface Options {
    studentId: string;
}

export const getAllergiesForStudentAsync = async ({ studentId }: Options): Promise<AllergyResponse[]> => {
    await sleep();

    let endpoint = `/students/${studentId}/allergies`;

    if (IS_MOCKABLE)
        endpoint = "/students/student-allergies/student-allergies.json";

    const { data } = await api.get<AllergyResponse[]>(endpoint);

    return data;
}
