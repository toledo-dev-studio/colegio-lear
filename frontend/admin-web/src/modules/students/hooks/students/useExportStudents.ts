import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { isValidBooleanString, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { getStudentsActionAsync } from "../../actions/students/get-students.action";

export const useExportStudents = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = searchParams.get("query")?.trim() || undefined;

    // Advanced query filters
    const name = searchParams.get("name")?.trim() || undefined;
    const curp = searchParams.get("curp")?.trim() || undefined;
    const enrollment = searchParams.get("enrollment")?.trim() || undefined;
    const email = searchParams.get("email")?.trim() || undefined;
    const phoneNumber = searchParams.get("phone-number")?.trim() || undefined;
    const status = isValidBooleanString(searchParams.get("status")) ? stringToBooleanWithDefault(searchParams.get("status")) : undefined;

    return useMutation({
        mutationFn: () => getStudentsActionAsync({
            query,
            name,
            curp,
            enrollment,
            email,
            phoneNumber,
            status
        }),
    });
}
