import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { StudentGuardian } from "@/interfaces/entites/student-guardian";

interface Options {
    studentGuardianLike: Partial<StudentGuardian>
}

export const createUpdateStudentGuardianForStudentActionAsync = async ({ studentGuardianLike }: Options): Promise<StudentGuardian> => {
    await sleep();

    const { id, studentId } = studentGuardianLike;
    const isCreating = id === undefined;

    // REMOVE
    if (VITE_ENVIRONMENT === "development") {
        studentGuardianLike.id = isCreating ? generateTemporalId() : id;
        return studentGuardianLike as StudentGuardian;
    }

    const { data } = await api<StudentGuardian>({
        url: isCreating ? `/students/${studentId}/guardians` : `/students/${studentId}/guardians/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: { ...studentGuardianLike }
    });

    return {
        ...data,
    };
}
