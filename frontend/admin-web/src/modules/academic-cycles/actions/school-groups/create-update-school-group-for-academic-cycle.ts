import { api } from "@/api/client";
import { sleep } from "@/lib/extensions/promises";
import { generateTemporalId } from "@/lib/extensions/utils";
import { VITE_ENVIRONMENT } from "@/lib/constants/environment.constants";
import type { AcademicCycleSchoolGroup } from "@/interfaces/entites/academic-cycle-school-group";

interface Options {
    academicCycleSchoolGroupLike: Partial<AcademicCycleSchoolGroup>
}

export const createUpdateSchoolGroupForAcademicCycleActionAsync = async ({ academicCycleSchoolGroupLike }: Options): Promise<AcademicCycleSchoolGroup> => {
    await sleep();

    const { id, academicCycleId } = academicCycleSchoolGroupLike;
    const isCreating = id === undefined;
    
    // REMOVE
    if (VITE_ENVIRONMENT === "development") {
        academicCycleSchoolGroupLike.id = isCreating ? generateTemporalId() : id;
        return academicCycleSchoolGroupLike as AcademicCycleSchoolGroup;
    }

    const { data } = await api<AcademicCycleSchoolGroup>({
        url: isCreating ? `/academic-cycles/${academicCycleId}/school-groups` : `/academic-cycles/${academicCycleId}/school-groups/${id}`,
        method: isCreating ? 'POST' : 'PATCH',
        data: { ...academicCycleSchoolGroupLike }
    });

    return {
        ...data,
    };
}
