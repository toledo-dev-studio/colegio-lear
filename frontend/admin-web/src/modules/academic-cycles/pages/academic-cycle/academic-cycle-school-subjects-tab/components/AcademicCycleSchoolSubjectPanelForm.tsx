import { Controller, useForm } from "react-hook-form";
import { useOutletContext } from "react-router";
import { X } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
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
            <form onSubmit={handleSubmit(onSubmit)} className="fixed inset-0 z-50 flex justify-end" data-testid="filter-drawer">

                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClickClose} />

                <aside className="relative box-border bg-card w-full max-w-md h-full border-l border-border shadow-2xl flex flex-col animate-slide-in-right">

                    <div className="h-22 flex items-center justify-between px-10 border-b border-border">
                        <h3 className="font-heading text-xl font-bold uppercase">
                            ASOCIACIÓN DE MATERIA
                        </h3>
                        <Button onClick={handleClickClose} data-testid="filter-drawer-close" className="min-w-10 min-h-10 bg-card text-foreground px-0!">
                            <X className="w-5! h-5! text-muted-foreground" />
                        </Button>
                    </div>

                    {/* Fields */}
                    <section className="flex-1 overflow-y-auto px-10 py-10 space-y-5">

                        <section className="flex flex-col gap-8">

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

                        </section>
                    </section>


                    {/* Actions section */}
                    <section className="px-8 py-6 border-t border-border flex items-center justify-between gap-3 box-border">
                        <Button type="button" variant={"ghost"} onClick={handleClickClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant={"default"}>
                            Guardar
                        </Button>
                    </section>

                </aside>

            </form>
        </>
    )
}
