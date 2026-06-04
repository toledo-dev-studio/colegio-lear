import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolSubject } from "@/interfaces/entites/academic-cycle-school-subject";

interface Options {
    academicCycleSchoolSubjectLike: Partial<AcademicCycleSchoolSubject>
}

export const createUpdateSchoolSubjectForAcademicCycleActionAsync = async ({ academicCycleSchoolSubjectLike }: Options): Promise<AcademicCycleSchoolSubject> => {
    await sleep();

    const { id, academicCycleId } = academicCycleSchoolSubjectLike;
    const isCreating = id === undefined;
    
    // REMOVE
    if (VITE_ENVIRONMENT === "development") {
        academicCycleSchoolSubjectLike.id = isCreating ? generateTemporalId() : id;
        return academicCycleSchoolSubjectLike as AcademicCycleSchoolSubject;
    }

    const { data } = await api<AcademicCycleSchoolSubject>({
        url: isCreating ? `/academic-cycles/${academicCycleId}/school-subjects` : `/academic-cycles/${academicCycleId}/school-subjects/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: { ...academicCycleSchoolSubjectLike }
    });

    return {
        ...data,
    };
}
