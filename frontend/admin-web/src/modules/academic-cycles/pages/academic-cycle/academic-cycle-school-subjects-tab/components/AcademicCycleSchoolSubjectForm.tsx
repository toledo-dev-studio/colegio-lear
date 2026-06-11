import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useOutletContext } from "react-router";

import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";
import { SearchInput } from "@/shared/components/search-input/SearchInput";
import { TabSectionTitle } from "@/shared/components/tab-section-title/TabSectionTitle";
import { useSearchSchoolSubjects } from "@/modules/school-subjects/hooks/useSearchSchoolSubjects";
import type { AcademicCycleSchoolSubject } from "@/interfaces/entites/academic-cycle-school-subject";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";

interface Props {
    academicCycleSchoolSubject?: Partial<AcademicCycleSchoolSubject | undefined>;
    setAcademicCycleSchoolSubject: React.Dispatch<React.SetStateAction<Partial<AcademicCycleSchoolSubject> | undefined>>;
    onSubmit: (academicCycleSchoolSubjectLike: Partial<AcademicCycleSchoolSubject>) => void;
}

export const AcademicCycleSchoolSubjectForm = ({ academicCycleSchoolSubject, setAcademicCycleSchoolSubject, onSubmit }: Props) => {
    // Get context from layout
    const { academicCycleId, academicCycle } = useOutletContext<AcademicCycleLayoutContext>();

    // Componet hooks & stores
    const searchSchoolSubjectsMutation = useSearchSchoolSubjects();
    const schoolSubjectSearchInputRef = useRef<HTMLInputElement>(null);

    // Use react hook form configuration
    const { control, handleSubmit, formState: { errors }, setValue, setFocus, watch, reset } = useForm<Partial<AcademicCycleSchoolSubject>>({
        defaultValues: {
            id: academicCycleSchoolSubject?.id,
            schoolSubjectId: academicCycleSchoolSubject?.id ?? undefined,
            observations: academicCycleSchoolSubject?.observations ?? "",
            schoolSubject: academicCycleSchoolSubject?.schoolSubject,
            academicCycleId: academicCycleId,
        }
    });
    const isNewRecord = watch("id") === undefined;
    const schoolSubject = watch("schoolSubject");

    useEffect(() => {
        requestAnimationFrame(() => {
            reset({
                id: academicCycleSchoolSubject?.id,
                schoolSubjectId: academicCycleSchoolSubject?.id ?? undefined,
                observations: academicCycleSchoolSubject?.observations ?? "",
                schoolSubject: academicCycleSchoolSubject?.schoolSubject,
                academicCycleId: academicCycleId,
            });
            if (academicCycleSchoolSubject?.id)
                requestAnimationFrame(() => setFocus("observations"));
        });
    }, [academicCycleSchoolSubject]);

    return (
        <>
            <form className="flex flex-col gap-y-8"
                onSubmit={
                    handleSubmit(
                        onSubmit,
                        () => (errors.schoolSubjectId && !schoolSubject?.id) && schoolSubjectSearchInputRef.current?.focus())
                }>
                <section className="flex flex-col gap-y-6 mt-2 border-b border-border pb-8">
                    <TabSectionTitle
                        title="ASOCIACIÓN DE MATERIA AL CICLO ESCOLAR"
                        description="En esta sección podrás configurar aquellas materias que deberán cursar los alumnos una vez inscritos a este ciclo escolar." />

                    {/* Fields */}
                    <section className="grid grid-cols-1 gap-8">
                        <div className="control-container">
                            <label className="label">Materia <span className="required">*</span>:</label>
                            <Controller
                                name="schoolSubjectId"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <SearchInput
                                        {...field}
                                        ref={schoolSubjectSearchInputRef}
                                        name="schoolSubjectId"
                                        defaultValue={schoolSubject?.name}
                                        selected={!!schoolSubject?.id}
                                        placeholder="Busqueda de materia escolar"
                                        options={searchSchoolSubjectsMutation.schoolSubjects}
                                        isSearching={searchSchoolSubjectsMutation.isPending}
                                        onClearSelection={() => {
                                            setValue("schoolSubjectId", undefined);
                                            setValue("schoolSubject", undefined);
                                        }}
                                        onOptionChange={async (option: SchoolSubject) => {
                                            setValue("schoolSubjectId", option.id);
                                            setValue("schoolSubject", option);
                                            searchSchoolSubjectsMutation.clearSearchResult();
                                        }}
                                        onSearch={async (query) => searchSchoolSubjectsMutation.searchAsync({
                                            query,
                                            status: true,
                                            academicLevelId: academicCycle.academicLevelId,
                                            educationLevelId: academicCycle.educationLevelId
                                        })}
                                    />
                                )}
                            />
                            {
                                (errors.schoolSubjectId && !schoolSubject?.id) && (
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
                            <label className="label">Comentarios adicionales:</label>
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
                    </section>

                    {/* Actions section */}
                    <section className="flex items-center justify-end mt-8 gap-x-4 border-t border-border pt-8">
                        {
                            !isNewRecord &&
                            <Button type="button" aria-label="cancel" variant={"ghost"} onClick={() => setAcademicCycleSchoolSubject({})}>
                                Cancelar
                            </Button>
                        }
                        <Button type="submit">
                            {
                                isNewRecord ? "Agregar nueva materia" : "Actualizar materia"
                            }
                        </Button>
                    </section>
                </section>
            </form>
        </>
    )
}
