import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { GET_SCHOOL_SUBJECT_MATERIALS_QUERY_KEY } from "@/lib/queries-key/subjects-queries-key";
import { getSchoolSubjectMaterialsAsync } from "../api/get-school-subject-materials.api";

interface Options {
    academicCycleId: string;
    academicCycleSchoolGroupId: string;
    academicCycleSchoolSubjectId: string;
}

export const getSchoolSubjectMaterialsQueryKey = ({ academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId }: Options) =>
    [GET_SCHOOL_SUBJECT_MATERIALS_QUERY_KEY, { academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId }];

export const useGetSchoolSubjectMaterials = ({ academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId }: Options) => {
    const queryResult = useQuery({
        queryKey: getSchoolSubjectMaterialsQueryKey({ academicCycleId, academicCycleSchoolGroupId, academicCycleSchoolSubjectId }),
        queryFn: () =>
            getSchoolSubjectMaterialsAsync({
                academicCycleId,
                academicCycleSchoolGroupId,
                academicCycleSchoolSubjectId,
            }),
        enabled: !!academicCycleId && !!academicCycleSchoolGroupId && !!academicCycleSchoolSubjectId,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });

    return { ...queryResult, data: queryResult.data ?? [] };
}
