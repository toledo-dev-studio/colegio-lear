import { useOutletContext } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Textarea } from "@/shared/ui/textarea";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import { SearchInput } from "@/shared/components/search-input/SearchInput";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";
import { useSearchSchoolSubjects } from "@/modules/school-subjects/hooks/useSearchSchoolSubjects";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import type { AcademicCycleSchoolSubjectRequest } from "@/interfaces/requests/academic-cycle-school-subject.request";
import type { AcademicCycleSchoolSubjectResponse } from "@/interfaces/responses/academic-cycle-school-subject.response";

interface Props {
    academicCycleSchoolSubjectResponse?: Partial<AcademicCycleSchoolSubjectResponse>;
    handleClickClose: () => void;
    onSubmit: (academicCycleSchoolSubjectRequestLike: Partial<AcademicCycleSchoolSubjectRequest>) => void;
}

export const AcademicCycleSchoolSubjectPanelForm = ({ academicCycleSchoolSubjectResponse, handleClickClose, onSubmit }: Props) => {
    // Get context from layout
    const { academicCycleId, academicCycle } = useOutletContext<AcademicCycleLayoutContext>();

    // Componet hooks & stores
    const searchSchoolSubjectsMutation = useSearchSchoolSubjects();

    // Use react hook form configuration
    const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<Partial<AcademicCycleSchoolSubjectRequest>>({
        defaultValues: {
            academicCycleId: academicCycleId,
            observations: isValidValueWithDefault(academicCycleSchoolSubjectResponse?.observations, ""),
            schoolSubjectId: isValidValueWithDefault(academicCycleSchoolSubjectResponse?.schoolSubjectId, ""),
            schoolSubject: isValidValueWithDefault(academicCycleSchoolSubjectResponse?.schoolSubject, undefined),
        }
    });
    const schoolSubject = watch("schoolSubject");

    return (
        <>
            <SidePanel
                title="ASOCIACIÓN DE MATERIA"
                handleClickClose={handleClickClose}
                cancelButton={{ show: true, disabled: false, type: "button", label: "Cancelar", handleClick: handleClickClose }}
                submitButton={{ show: true, disabled: false, type: "submit", label: "Guardar", handleClick: handleSubmit(onSubmit) }}>

                <form className="flex flex-col gap-8">

                    <div className="control-container">
                        <label className="label">Materia escolar <span className="required">*</span>:</label>
                        <Controller
                            name="schoolSubjectId"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <SearchInput
                                    {...field}
                                    defaultValue={schoolSubject?.name}
                                    selected={!!schoolSubject}
                                    placeholder="Busqueda de materia escolar"
                                    options={searchSchoolSubjectsMutation.schoolSubjects}
                                    isSearching={searchSchoolSubjectsMutation.isPending}
                                    onClearSelection={() => {
                                        setValue("schoolSubjectId", "");
                                        setValue("schoolSubject", undefined);
                                    }}
                                    onOptionChange={async (option: SchoolSubjectResponse) => {
                                        setValue("schoolSubjectId", option.id);
                                        setValue("schoolSubject", option);
                                        searchSchoolSubjectsMutation.clearSearchResult();
                                    }}
                                    onSearch={async (query) => searchSchoolSubjectsMutation.searchAsync({
                                        query,
                                        isActive: true,
                                        academicLevelId: academicCycle!.academicLevelId,
                                        educationLevelId: academicCycle!.educationLevelId
                                    })}
                                />
                            )}
                        />
                        {
                            (errors.schoolSubjectId && !schoolSubject) && (
                                <p className="error">
                                    La materia escolar es obligatoria
                                </p>
                            )
                        }
                    </div>

                    <div className="control-container">
                        <label className="label">Descripción de la materia:</label>
                        <Textarea
                            value={schoolSubject?.description ?? "-"}
                            disabled={true}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Comentarios adicionales de la asignación:</label>
                        <Controller
                            name="observations"
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="-"
                                />
                            )}
                        />
                    </div>

                </form>

            </SidePanel>
        </>
    )
}
