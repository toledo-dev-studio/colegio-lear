import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";

interface Options {
  studentId: string;
  academicCycleId: string;
}

export const getAcademicCycleEnrollmentForStudentAsync = async ({ studentId, academicCycleId }: Options): Promise<AcademicCycleEnrollmentResponse> => {
  await sleep();

  if (IS_MOCKABLE) {
    const { data } = await api.get<AcademicCycleEnrollmentResponse>("/enrollments/enrollment.json");
    return data;
  }

  const { data } = await api.get<AcademicCycleEnrollmentResponse>(`/students/${studentId}/academic-cycles/${academicCycleId}/enrollment`);

  return data;
};
