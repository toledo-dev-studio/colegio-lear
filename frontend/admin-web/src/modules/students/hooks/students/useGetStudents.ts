import { useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";

import { getStudentsActionAsync } from "../../actions/students/get-students.action";
import { isValidBooleanString, isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";

export const useGetStudents = () => {
    const [searchParams] = useSearchParams();

    // Main query filters
    const query = isValidValueWithDefault(searchParams.get("query")?.trim(), undefined);

    // Advanced query filters
    const fullName = isValidValueWithDefault(searchParams.get("full-name")?.trim(), undefined);
    const curp = isValidValueWithDefault(searchParams.get("curp")?.trim(), undefined);
    const enrollment = isValidValueWithDefault(searchParams.get("enrollment")?.trim(), undefined);
    const email = isValidValueWithDefault(searchParams.get("email")?.trim(), undefined);
    const phoneNumber = isValidValueWithDefault(searchParams.get("phone-number")?.trim(), undefined);
    const isActive = isValidBooleanString(searchParams.get("is-active")) ? stringToBooleanWithDefault(searchParams.get("is-active")) : undefined;

    return useMutation({
        mutationFn: () => getStudentsActionAsync({
            query,
            fullName,
            curp,
            email,
            enrollment,
            isActive,
            phoneNumber
        }),
    });
}
