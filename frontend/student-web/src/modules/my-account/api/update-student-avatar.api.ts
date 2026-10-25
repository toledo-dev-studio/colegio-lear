import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { StudentResponse } from "@/interfaces/responses/student.response";

interface Options {
    file: File;
}

// API para actualizar el avatar del alumno autenticado

export const updateStudentAvatarAsync = async ({ file }: Options): Promise<StudentResponse> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data: account } = await api.get<StudentResponse>("/account/student-account.json");
        return {
            ...account,
            avatar: URL.createObjectURL(file),
        };
    }

    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post<StudentResponse>("/students/me/avatar", formData);

    return data;
}