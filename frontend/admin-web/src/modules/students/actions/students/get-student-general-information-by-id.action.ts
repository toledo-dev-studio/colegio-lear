import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import type { Student } from "@/interfaces/entites/student";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const getStudentGeneralInformationByIdActionAsync = async (id?: string): Promise<Student> => {
    await sleep();

    if (!id)
        throw new Error("El identificador del registro es requerido");

    if (id === "new") {
        return { id: undefined, status: true } as unknown as Student;
    }

    if (VITE_ENVIRONMENT === "development") {
        const { data } = await api.get<Student[]>("http://localhost/api/students/students/students.json");
        const record = data.find(item => item.id === id);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        return record;
    }

    const { data } = await api.get<Student>(`/students/${id}`);

    return data;
}
