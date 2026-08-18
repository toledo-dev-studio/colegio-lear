import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { StudentGuardianResponse } from "@/interfaces/responses/student-guardian.response";

interface Options {
    studentId: string;
}

export const getStudentGuardiansForStudentAsync = async ({ studentId }: Options): Promise<StudentGuardianResponse[]> => {
    await sleep();

    let endpoint = `/students/${studentId}/guardians`;

    if (IS_MOCKABLE)
        endpoint = "/students/student-guardians/student-guardians.json";
    
    const { data } = await api.get<StudentGuardianResponse[]>(endpoint);

    return data;
}
