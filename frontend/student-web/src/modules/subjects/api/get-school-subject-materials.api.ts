import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";
import type { SchoolSubjectMaterialResponse } from "@/interfaces/responses/school-subject-material.response";

interface Options {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
    academicCycleSchoolSubjectId: string;
}

export const getSchoolSubjectMaterialsAsync = async ({
    academicCycleId,
    academicCycleSchoolGroupId,
    academicCycleSchoolSubjectId,
}: Options): Promise<SchoolSubjectMaterialResponse[]> => {
    await sleep();

    if (IS_MOCKABLE) {
        const { data } = await api.get<SchoolSubjectMaterialResponse[]>("/subjects/materials.json");

        return data.filter(
            (material) =>
                material.academicCycleId === academicCycleId &&
                material.academicCycleSchoolGroupId === academicCycleSchoolGroupId &&
                material.academicCycleSchoolSubjectId === academicCycleSchoolSubjectId,
        );
    }

    const { data } = await api.get<SchoolSubjectMaterialResponse[]>(
        `/academic-cycles/${academicCycleId}/school-groups/${academicCycleSchoolGroupId}/school-subjects/${academicCycleSchoolSubjectId}/materials`,
    );

    return data;
}
