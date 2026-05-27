import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import type { Student } from "@/interfaces/entites/student";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";

export const createUpdateStudentGeneralInformationActionAsync = async (studentLike: Partial<Student>): Promise<Student> => {
    await sleep();

    const { id } = studentLike;
    const isCreating = id === undefined;

    if (VITE_ENVIRONMENT === "mockable") {
        studentLike.id = isCreating ? generateTemporalId() : id;
        return studentLike as Student;
    }

    const { data } = await api<Student>({
        url: isCreating ? "/students" : `/students/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: {
            ...studentLike,
        }
    });

    return {
        ...data,
    };
}
