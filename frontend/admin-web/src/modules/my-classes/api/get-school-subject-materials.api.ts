import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { SchoolSubjectMaterialResponse } from "@/interfaces/responses/school-subject-material.response";

interface Options {
    academicCycleSchoolGroupId: string;
    schoolSubjectId: string;
}

export const getSchoolSubjectMaterialsAsync = async ({ academicCycleSchoolGroupId, schoolSubjectId }: Options): Promise<SchoolSubjectMaterialResponse[]> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<SchoolSubjectMaterialResponse[]>("/my-classes/school-subject-materials.json");
        return data.filter(material => material.academicCycleSchoolGroupId === academicCycleSchoolGroupId && material.schoolSubjectId === schoolSubjectId);
    }

    const { data } = await api.get<SchoolSubjectMaterialResponse[]>(`/me/school-groups/${academicCycleSchoolGroupId}/subjects/${schoolSubjectId}/materials`);

    return data;
}