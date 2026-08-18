import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { ScholarshipRequest } from "@/interfaces/requests/scholarship.request";
import type { ScholarshipResponse } from "@/interfaces/responses/scholarship.response";

interface Options {
    id: string;
    scholarshipRequestLike: Partial<ScholarshipRequest>;
}

export const createUpdateScholarshipAsync = async ({ id, scholarshipRequestLike }: Options): Promise<ScholarshipResponse> => {
    await sleep();

    const isCreating = id === "new";

    if (IS_MOCKABLE) {
        return {
            ...scholarshipRequestLike,
            id: isCreating ? generateTemporalId() : id
        } as ScholarshipResponse;
    }

    const { data } = await api<ScholarshipResponse>({
        url: isCreating ? '/scholarships' : `/scholarships/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: scholarshipRequestLike
    });

    return {
        ...data,
    };
}
