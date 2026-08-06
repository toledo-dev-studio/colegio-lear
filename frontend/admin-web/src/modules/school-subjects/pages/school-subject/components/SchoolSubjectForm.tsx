import { useNavigate } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { Form } from "@/shared/components/form/Form";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { SearchInput } from "@/shared/components/search-input/SearchInput";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { SchoolSubjectRequest } from "@/interfaces/requests/school-subject.request";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";
import type { AcademicLevelResponse } from "@/interfaces/responses/academic-level.response";
import type { EducationLevelResponse } from "@/interfaces/responses/education-level.response";
import { useSearchAcademicLevels } from "@/modules/academic-levels/hooks/academic-levels/useSearchAcademicLevels";
import { useSearchEducationLevels } from "@/modules/academic-levels/hooks/education-levels/useSearchEducationLevels";

interface Props {
    isSubmitting: boolean,
    schoolSubjectResponse?: SchoolSubjectResponse,
    onSubmit: (schoolSubjectRequestLike: Partial<SchoolSubjectRequest>) => void
}

export const SchoolSubjectForm = ({ schoolSubjectResponse, isSubmitting, onSubmit }: Props) => {
    // Component hooks & stores
    const navigate = useNavigate();
    const searchAcademicLevelsMutation = useSearchAcademicLevels();
    const searchEducationLevelsMutation = useSearchEducationLevels();

    // Use react hook form configuration
    const { control, formState: { errors }, handleSubmit, setValue, watch } = useForm<Partial<SchoolSubjectRequest>>({
        defaultValues: {
            name: isValidValueWithDefault(schoolSubjectResponse?.name, ""),
            isActive: isValidValueWithDefault(schoolSubjectResponse?.isActive, false),
            academicLevelId: isValidValueWithDefault(schoolSubjectResponse?.academicLevelId, ""),
            academicLevel: isValidValueWithDefault(schoolSubjectResponse?.academicLevel, undefined),
            educationLevelId: isValidValueWithDefault(schoolSubjectResponse?.educationLevelId, ""),
            educationLevel: isValidValueWithDefault(schoolSubjectResponse?.educationLevel, undefined),
            description: isValidValueWithDefault(schoolSubjectResponse?.description, ""),
        }
    });
    const academicLevel = watch("academicLevel");
    const academicLevelId = watch("academicLevelId");
    const educationLevel = watch("educationLevel");
    const educationLevelId = watch("educationLevelId");

    return (
        <>
            <Form moduleKey="school-subjects" isSubmitting={isSubmitting} onSubmit={handleSubmit(onSubmit)} onCancel={() => navigate("/school-subjects")}>

                <section className="flex flex-col gap-y-6">

                    <SectionTitle
                        title="INFORMACIÓN GENERAL DE LA MATERIA ESCOLAR"
                        description="Registro de información básica de la materia escolar disponible en el colegio." />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        <div className="control-container">
                            <label className="label">Nombre de la materia escolar <span className="required">*</span>:</label>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        placeholder="Nombre de la materia escolar..."
                                    />
                                )} />
                            {
                                errors.name && (
                                    <p className="error">
                                        El nombre de la materia escolar es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Nivel académico <span className="required">*</span>:</label>
                            <Controller
                                name="academicLevelId"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <SearchInput
                                        {...field}
                                        defaultValue={academicLevel?.name}
                                        selected={!!academicLevelId}
                                        placeholder="Busqueda de nivel académico"
                                        options={searchAcademicLevelsMutation.academicLevels}
                                        isSearching={searchAcademicLevelsMutation.isPending}
                                        onClearSelection={() => {
                                            setValue("academicLevel", undefined);
                                            setValue("academicLevelId", undefined);
                                            setValue("educationLevel", undefined);
                                            setValue("educationLevelId", undefined);
                                            searchAcademicLevelsMutation.clearSearchResult();
                                        }}
                                        onOptionChange={async (option: AcademicLevelResponse) => {
                                            setValue("academicLevel", option);
                                            setValue("academicLevelId", option.id);
                                            searchAcademicLevelsMutation.clearSearchResult();
                                        }}
                                        onSearch={async (query) => searchAcademicLevelsMutation.searchAsync({ query, isActive: true })}
                                    />
                                )}
                            />
                            {
                                (errors.academicLevelId && !academicLevel) && (
                                    <p className="error">
                                        El nivel académico es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Grado educativo <span className="required">*</span>:</label>
                            <Controller
                                name="educationLevelId"
                                control={control}
                                disabled={!academicLevelId}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <SearchInput
                                        {...field}
                                        defaultValue={educationLevel?.name}
                                        selected={!!educationLevelId}
                                        disabled={!academicLevelId}
                                        placeholder="Busqueda de grado educativo"
                                        options={searchEducationLevelsMutation.educationLevels}
                                        isSearching={searchEducationLevelsMutation.isPending}
                                        onClearSelection={() => {
                                            setValue("educationLevel", undefined);
                                            setValue("educationLevelId", undefined);
                                            searchAcademicLevelsMutation.clearSearchResult();
                                        }}
                                        onOptionChange={async (option: EducationLevelResponse) => {
                                            setValue("educationLevel", option);
                                            setValue("educationLevelId", option.id);
                                            searchEducationLevelsMutation.clearSearchResult();
                                        }}
                                        onSearch={async (query) => searchEducationLevelsMutation.searchAsync({ query, academicLevelId: academicLevelId, isActive: true })}
                                    />
                                )}
                            />
                            {
                                (errors.educationLevelId && !educationLevel) && (
                                    <p className="error">
                                        El grado educativo es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container md:col-span-2">
                            <label className="label">¿Registro activo?:</label>
                            <div className="flex items-center justify-center">
                                <Controller
                                    name="isActive"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="switch-control-container">
                                            <div>
                                                <p className="label">{field.value ? "Activo" : "Inactivo"}</p>
                                                <p className="description">La materia escolarse encuentra activa o inactiva.</p>
                                            </div>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </label>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="control-container lg:col-span-2">
                            <label className="label">Descripción de la materia escolar:</label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        placeholder="-"
                                    />
                                )}
                            />
                        </div>

                    </div>

                </section>

            </Form>
        </>
    )
}