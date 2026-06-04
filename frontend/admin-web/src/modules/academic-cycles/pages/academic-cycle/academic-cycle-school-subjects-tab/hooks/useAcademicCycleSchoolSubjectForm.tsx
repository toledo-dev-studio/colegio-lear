import { useOutletContext } from "react-router";
import { useForm } from "react-hook-form";

import type { AcademicCycleSchoolSubject } from "@/interfaces/entites/academic-cycle-school-subject";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";

export const useAcademicCycleSchoolSubjectForm = () => {
    // Get context from layout
    const { academicCycleId } = useOutletContext<AcademicCycleLayoutContext>();

    // Use react hook form configuration
    const { control, register, handleSubmit, formState: { errors }, watch, setValue, setValues } = useForm<Partial<AcademicCycleSchoolSubject>>({
        defaultValues: {
            id: undefined,
            schoolSubjectId: undefined,
            observations: undefined,
            academicCycleId: academicCycleId,
        }
    });

    const reset = (academicCycleSchoolSubject: AcademicCycleSchoolSubject | undefined = undefined) => {
        setValues({
            id: academicCycleSchoolSubject?.id,
            schoolSubjectId: academicCycleSchoolSubject?.id,
            observations: academicCycleSchoolSubject?.observations,
            schoolSubject: academicCycleSchoolSubject?.schoolSubject,
            academicCycleId: academicCycleId,
        });
    };

    return {
        control,
        errors,
        watcher: {
            isNewRecord: watch("id") === undefined ? true : false,
            schoolSubject: watch("schoolSubject")
        },
        setValue,
        register,
        handleSubmit,
        reset
    }
}
