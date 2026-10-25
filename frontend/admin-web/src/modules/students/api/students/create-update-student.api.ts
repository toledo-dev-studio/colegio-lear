import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { StudentRequest } from "@/interfaces/requests/student.request";
import type { StudentResponse } from "@/interfaces/responses/student.response";

interface Options {
    id: string;
    studentRequestLike: Partial<StudentRequest>;
}

export const createUpdateStudentAsync = async ({ id, studentRequestLike }: Options): Promise<StudentResponse> => {
    await sleep();

    const isCreating = id === "new";

    if (IS_MOCKABLE) {
        return {
            ...studentRequestLike,
            id: isCreating ? generateTemporalId() : id
        } as StudentResponse;
    }

    const { data } = await api<StudentResponse>({
        url: isCreating ? "/students" : `/students/${id}`,
        method: isCreating ? "POST" : "PATCH",
        data: {
            ...studentRequestLike,
        }
    });

    return {
        ...data,
    };
}
