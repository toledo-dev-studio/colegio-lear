import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { getSchoolSubjectsActionAsync } from "../actions/get-school-subjects.action";
import { isValidBooleanString, isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";

export const useGetSchoolSubjects = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);

    // Advanced query filters
    const name = isValidValueWithDefault(searchParams.get("name")?.trim(), undefined)
    const isActive = isValidBooleanString(searchParams.get("is-active")) ? stringToBooleanWithDefault(searchParams.get("is-active")) : undefined;
    const academicLevelId = isValidValueWithDefault(searchParams.get("academic-level-id"), undefined);
    const educationLevelId = isValidValueWithDefault(searchParams.get("education-level-id"), undefined);

    return useMutation({
        mutationFn: () => getSchoolSubjectsActionAsync({
            query,
            name,
            isActive,
            academicLevelId,
            educationLevelId
        }),
    });
}
