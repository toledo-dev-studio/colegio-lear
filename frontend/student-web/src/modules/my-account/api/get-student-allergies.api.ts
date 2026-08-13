import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AllergyResponse } from "@/interfaces/responses/allergy.response";

// API para obtener las alergias del alumno autenticado

export const getStudentAllergiesAsync = async (): Promise<AllergyResponse[]> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<AllergyResponse[]>("/account/allergies.json");
        return data;
    }

    const { data } = await api.get<AllergyResponse[]>("/students/me/allergies");

    return data;
}