import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolGroupEnrollment } from "@/interfaces/entites/academic-cycle-school-group-enrollment";

interface Options {
    studentId: string;
    academicCycleSchoolGroupEnrollmentId: string;
}

export const getEnrollmentByIdForStudentActionAsync = async ({ studentId, academicCycleSchoolGroupEnrollmentId }: Options): Promise<AcademicCycleSchoolGroupEnrollment> => {
    await sleep();

    if (!studentId || academicCycleSchoolGroupEnrollmentId)
        throw new Error("El identificador del registro es requerido");

    // REMOVE
    if (VITE_ENVIRONMENT === "development") {
        const { data } = await api.get<AcademicCycleSchoolGroupEnrollment[]>("http://localhost/api/students/enrollments/enrollment.json");
        const record = data.find(item => item.id === academicCycleSchoolGroupEnrollmentId);
        if (!record)
            throw new Error("No se encontró el registro solicitado");
        return record;
    }

    const { data } = await api.get<AcademicCycleSchoolGroupEnrollment>(`/students/${studentId}/enrollments/${academicCycleSchoolGroupEnrollmentId}`);

    return data;
}
