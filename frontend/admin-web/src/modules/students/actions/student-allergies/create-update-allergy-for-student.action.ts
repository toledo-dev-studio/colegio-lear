import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AllergyRequest } from "@/interfaces/requests/allergy.request";
import type { AllergyResponse } from "@/interfaces/responses/allergy.response";

interface Options {
    id: string;
    studentId: string;
    allergyRequestLike: Partial<AllergyRequest>;
}

export const createUpdateAllergyForStudentActionAsync = async ({ id, studentId, allergyRequestLike }: Options): Promise<AllergyResponse> => {
    await sleep();

    const isCreating = id === "new";

    // REMOVE
    if (VITE_ENVIRONMENT === "development") {
        return {
            ...allergyRequestLike,
            studentId,
            id: isCreating ? generateTemporalId() : id,
        } as AllergyResponse;
    }

    const { data } = await api<AllergyResponse>({
        url: isCreating ? `/students/${studentId}/allergies` : `/students/${studentId}/allergies/${id}`,
        method: isCreating ? "POST" : "PATCH",
        data: { ...allergyRequestLike }
    });

    return {
        ...data,
    };
}
