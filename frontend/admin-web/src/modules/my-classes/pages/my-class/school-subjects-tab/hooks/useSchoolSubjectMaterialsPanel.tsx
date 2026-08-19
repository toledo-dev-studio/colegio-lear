import { useState } from "react";

import { useGetSchoolSubjectMaterials } from "../../../../hooks/useGetSchoolSubjectMaterials";
import type { SchoolSubjectMaterialResponse } from "@/interfaces/responses/school-subject-material.response";

interface Options {
    academicCycleSchoolGroupId: string;
    schoolSubjectId: string;
    loggedInUserCanWrite: boolean;
}

export const useSchoolSubjectMaterialsPanel = ({ academicCycleSchoolGroupId, schoolSubjectId, loggedInUserCanWrite }: Options) => {
    // Queries
    const getSchoolSubjectMaterialsQuery = useGetSchoolSubjectMaterials({ academicCycleSchoolGroupId, schoolSubjectId });

    // Components hooks & stores
    const [materials, setMaterials] = useState<SchoolSubjectMaterialResponse[]>([]);
    const [hydratedKey, setHydratedKey] = useState<string | undefined>(undefined);
    const [hasHydratedData, setHasHydratedData] = useState(false);

    // Hydrate materials state when the school subject changes or when query data first arrives (adjusting state during render)
    const currentKey = `${academicCycleSchoolGroupId}-${schoolSubjectId}`;
    const queryData = getSchoolSubjectMaterialsQuery.data;
    if (currentKey !== hydratedKey) {
        setHydratedKey(currentKey);
        setHasHydratedData(false);
        setMaterials(queryData ?? []);
    } else if (queryData && !hasHydratedData) {
        setHasHydratedData(true);
        setMaterials(queryData);
    }

    // Component functions
    const handleChangeMaterials = (
        next:
            | SchoolSubjectMaterialResponse[]
            | ((prev: SchoolSubjectMaterialResponse[]) => SchoolSubjectMaterialResponse[])
    ) => {
        setMaterials((prev) => (typeof next === "function" ? (next as (prev: SchoolSubjectMaterialResponse[]) => SchoolSubjectMaterialResponse[])(prev) : next));
    }

    return {
        materials,
        isLoading: getSchoolSubjectMaterialsQuery.isLoading,
        isError: getSchoolSubjectMaterialsQuery.isError,
        loggedInUserCanWrite,
        handleChangeMaterials,
    };
}

export type SchoolSubjectMaterialsPanelReturn = ReturnType<typeof useSchoolSubjectMaterialsPanel>;