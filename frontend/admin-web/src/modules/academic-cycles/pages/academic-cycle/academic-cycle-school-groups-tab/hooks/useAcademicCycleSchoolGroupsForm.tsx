import { useForm } from "react-hook-form";
import { useOutletContext } from "react-router";

import type { AcademicCycleSchoolGroup } from "@/interfaces/entites/academic-cycle-school-group";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";

export const useAcademicCycleSchoolGroupsForm = () => {
    // Get context from layout
    const { academicCycleId } = useOutletContext<AcademicCycleLayoutContext>();

    // Use react hook form configuration
    const { control, register, handleSubmit, formState: { errors }, watch, setValue, reset } = useForm<Partial<AcademicCycleSchoolGroup>>({
        defaultValues: {
            id: undefined,
            name: undefined,
            description: undefined,
            academicCycleId: academicCycleId,
        }
    });

    return {
        control,
        errors,
        watcher: {
            isNewRecord: watch("id") === undefined ? true : false,
            isDischargedGroup: watch("status") === "discharged",
            calendars: watch("calendars") ?? [],
        },
        setValue,
        register,
        handleSubmit,
        reset
    }
}
