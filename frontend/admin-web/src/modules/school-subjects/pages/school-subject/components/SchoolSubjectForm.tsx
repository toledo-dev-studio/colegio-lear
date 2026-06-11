import { useEffect } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { CustomSpinner } from "@/shared/components/CustomSpinner";
import type { SchoolSubject } from "@/interfaces/entites/school-subject"
import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import { SearchInput } from "@/shared/components/search-input/SearchInput";
import type { EducationLevel } from "@/interfaces/entites/education-level";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { useSearchAcademicLevels } from "@/modules/academic-levels/hooks/academic-levels/useSearchAcademicLevels";
import { useSearchEducationLevelsForAcademicLevel } from "@/modules/academic-levels/hooks/education-levels/useSearchEducationLevelsForAcademicLevel";

interface Props {
    schoolSubject?: SchoolSubject,
    isSubmitting: boolean,
    onSubmit: (schoolSubjectLike: Partial<SchoolSubject>) => void
}

export const SchoolSubjectForm = ({ schoolSubject, isSubmitting, onSubmit }: Props) => {

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        setValue,
        watch,
        reset
    } = useForm<Partial<SchoolSubject>>({
        defaultValues: schoolSubject
    });
    const selectedAcademicLevel = watch("academicLevelId");
    const selectedEducationLevel = watch("educationLevelId");

    // Academic levels assign configuration
    const searchAcademicLevels = useSearchAcademicLevels();

    // Education levels assign configuration
    const searchEducationLevelsForAcademicLevel = useSearchEducationLevelsForAcademicLevel();

    useEffect(() => {
        if (schoolSubject)
            reset(schoolSubject);
    }, [schoolSubject])

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6">

                <div className="flex flex-col items-start gap-y-4 md:items-center md:flex-row md:justify-between border-b border-border pb-4">
                    <h2 className="w-full text-muted-foreground">
                        INFORMACIÓN GENERAL DE LA MATERIA ESCOLAR
                    </h2>
                    <div className="w-fit flex items-center">
                        <Tooltip>
                            <TooltipTrigger>
                                <Switch
                                    size="default"
                                    checked={watch("status") ?? false}
                                    onCheckedChange={(checked) => setValue("status", checked)} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Estatus del registro</p>
                            </TooltipContent>
                        </Tooltip>

                    </div>
                </div>

                <div className="flex items-center flex-col gap-y-8">

                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-3 block">
                            Nombre de la materia escolar <span className="text-destructive">*</span>:
                        </label>
                        <Input
                            type="text"
                            {...register("name", { required: true })}
                            placeholder="Escribe la materia..."
                            className="pill-input w-full pl-8" />
                        {
                            errors.name && (
                                <p className="text-red-500 text-sm mt-2">
                                    El nombre de la materia escolar es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-2 block">Nivel académico <span className="text-destructive">*</span>:</label>
                        <SearchInput
                            {...register("academicLevelId", { required: true })}
                            defaultValue={watch("academicLevel.name")}
                            selected={!!selectedAcademicLevel}
                            placeholder="Busqueda de nivel académico"
                            options={searchAcademicLevels.academicLevels ?? []}
                            isSearching={searchAcademicLevels.isPending}
                            onClearSelection={() => {
                                setValue("academicLevelId", undefined);
                                setValue("academicLevel.name", undefined);
                                setValue("educationLevelId", undefined);
                                setValue("educationLevel.name", undefined);
                            }}
                            onOptionChange={async (option: AcademicLevel) => {
                                setValue("academicLevelId", option.id);
                                setValue("academicLevel.name", option.name);
                                searchAcademicLevels.clearSearchResult();
                            }}
                            onSearch={async (query) => searchAcademicLevels.searchAsync(query)}
                        />
                        {
                            (errors.academicLevelId && !selectedAcademicLevel) && (
                                <p className="text-red-500 text-sm mt-2">
                                    El nivel académico es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-2 block">Nivel educativo <span className="text-destructive">*</span>:</label>
                        <SearchInput
                            {...register("educationLevelId", { required: true })}
                            defaultValue={watch("educationLevel.name")}
                            selected={!!selectedEducationLevel}
                            disabled={!selectedAcademicLevel}
                            placeholder="Busqueda de nivel educativo"
                            options={searchEducationLevelsForAcademicLevel.educationLevels ?? []}
                            isSearching={searchEducationLevelsForAcademicLevel.isPending}
                            onClearSelection={() => {
                                setValue("educationLevelId", undefined);
                                setValue("educationLevel.name", undefined);
                            }}
                            onOptionChange={async (option: EducationLevel) => {
                                setValue("educationLevelId", option.id);
                                setValue("educationLevel.name", option.name);
                                searchEducationLevelsForAcademicLevel.clearSearchResult();
                            }}
                            onSearch={async (query) => searchEducationLevelsForAcademicLevel.searchAsync({
                                academicLevelId: selectedAcademicLevel!,
                                query
                            })}
                        />
                        {
                            (errors.educationLevelId && !selectedEducationLevel) && (
                                <p className="text-red-500 text-sm mt-2">
                                    El nivel educativo es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-3 block">Descripción de la materia escolar:</label>
                        <Textarea
                            {...register("description")}
                            defaultValue={getValues("description")}
                            placeholder="Descripción de la materia..."
                            className="pill-input w-full pl-8" />
                    </div>

                </div>

                 <div className="flex items-center justify-end mt-8 gap-x-4 border-t border-border pt-8">
                    <Link to="/school-subjects">
                        <Button type="button" disabled={isSubmitting} aria-label="cancel" variant={"ghost"}>
                            Cancelar
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting} aria-label="save-record">
                        Guardar
                        {
                            isSubmitting && (<CustomSpinner variant="primary" className="ml-4" />)
                        }
                    </Button>
                </div>

            </form>
        </>
    )
}