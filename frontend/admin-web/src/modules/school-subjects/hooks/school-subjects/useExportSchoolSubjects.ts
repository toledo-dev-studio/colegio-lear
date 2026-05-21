import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getSchoolSubjectsActionAsync } from "../../actions/get-school-subjects.action";

export const useExportSchoolSubjects = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get("query")?.trim() || "";

    // Advanced query filters
    const name = searchParams.get("name")?.trim() || "";
    const status = stringToBooleanWithDefault(searchParams.get("status"));
    const academicLevelId = searchParams.get("academic-level-id") || undefined;
    const educationLevelId = searchParams.get("education-level-id") || undefined;

    return useMutation({
        mutationFn: () => getSchoolSubjectsActionAsync({
            query,
            name,
            status,
            academicLevelId,
            educationLevelId
        }),
    });
}
