import { useQuery } from "@tanstack/react-query";

import { FIVE_MINUTES_STALE_TIME } from "@/lib/constants/tanstack.constants";
import { getSchoolSubjectMaterialsAsync } from "../api/get-school-subject-materials.api";
import { GET_SCHOOL_SUBJECT_MATERIALS_QUERY_KEY } from "@/lib/queries-key/my-classes-queries-key";

interface Options {
    academicCycleSchoolGroupId?: string;
    schoolSubjectId?: string;
}

export const useGetSchoolSubjectMaterials = ({ academicCycleSchoolGroupId, schoolSubjectId }: Options) => {
    return useQuery({
        queryKey: [GET_SCHOOL_SUBJECT_MATERIALS_QUERY_KEY, { academicCycleSchoolGroupId, schoolSubjectId }],
        queryFn: () => getSchoolSubjectMaterialsAsync({
            academicCycleSchoolGroupId: academicCycleSchoolGroupId!,
            schoolSubjectId: schoolSubjectId!,
        }),
        enabled: (!!academicCycleSchoolGroupId && !!schoolSubjectId),
        retry: false,
        staleTime: FIVE_MINUTES_STALE_TIME,
    });
}