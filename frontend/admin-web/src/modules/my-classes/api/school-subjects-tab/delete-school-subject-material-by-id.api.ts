import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";

interface Options {
    id: string;
    academicCycleSchoolGroupId: string;
    schoolSubjectId: string;
}

export const deleteSchoolSubjectMaterialByIdAsync = async ({ id, academicCycleSchoolGroupId, schoolSubjectId }: Options): Promise<{ id: string, academicCycleSchoolGroupId: string, schoolSubjectId: string }> => {
    await sleep();

    if (IS_MOCKABLE)
        return { id, academicCycleSchoolGroupId, schoolSubjectId };

    await api.delete(`/me/school-groups/${academicCycleSchoolGroupId}/subjects/${schoolSubjectId}/materials/${id}`);

    return { id, academicCycleSchoolGroupId, schoolSubjectId };
}