import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AllergyResponse } from "@/interfaces/responses/allergy.response";

interface Options {
    studentId: string;
}

export const getAllergiesForStudentActionAsync = async ({ studentId }: Options): Promise<AllergyResponse[]> => {
    await sleep();

    let endpoint = `/students/${studentId}/allergies`;

    if (VITE_ENVIRONMENT === "mockable")
        endpoint = "/students/student-allergies/student-allergies.json";

    // REMOVE
    endpoint = "http://localhost/api/students/student-allergies/student-allergies.json";

    const { data } = await api.get<AllergyResponse[]>(endpoint);

    return data;
}
