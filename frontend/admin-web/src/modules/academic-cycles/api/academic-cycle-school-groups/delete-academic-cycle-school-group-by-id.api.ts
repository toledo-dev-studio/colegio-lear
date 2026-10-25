import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { IS_MOCKABLE } from "@/lib/constants/environment.constants";

interface Options {
    id: string;
    academicCycleId: string;
}

export const deleteAcademicCycleSchoolGroupByIdAsync = async ({ id, academicCycleId }: Options): Promise<Options> => {
    await sleep();

    if (IS_MOCKABLE)
        return { id, academicCycleId };

    await api.delete(`/academic-cycles/${academicCycleId}/school-groups/${id}`);
    return { id, academicCycleId };
}
