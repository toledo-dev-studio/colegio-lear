import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentResponse } from "@/interfaces/responses/student.response";

interface Options {
    id: string;
}

export const getStudentByIdActionAsync = async ({ id }: Options): Promise<StudentResponse> => {
    await sleep();

    if (VITE_ENVIRONMENT === "mockable") {
        const { data } = await api.get<StudentResponse[]>("http://localhost/api/students/students/students.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        return record;
    }

    const { data } = await api.get<StudentResponse>(`/students/${id}`);

    return data;
}
