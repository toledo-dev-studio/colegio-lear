import { useState } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { stringToBooleanWithDefault } from "@/lib/utils";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import { CustomSearchInput } from "@/shared/components/CustomSearchInput";
import type { EducationLevel } from "@/interfaces/entites/education-level";
import { useAcademicLevelForSchoolSubject } from "@/modules/school-subjects/hooks/useAcademicLevelForSchoolSubject";
import { useEducationLevelForSchoolSubject } from "@/modules/school-subjects/hooks/useEducationLevelForSchoolSubject";
import { GET_ACADEMIC_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY, GET_EDUCATION_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY } from "@/modules/school-subjects/lib/queries-key";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const SchoolSubjectsAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {

    // Main hooks
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    // Form config
    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch
    } = useForm<Partial<SchoolSubject>>({
        defaultValues: {
            name: searchParams.get('query') ?? '',
            status: stringToBooleanWithDefault(searchParams.get('status')),
            academicLevelId: searchParams.get('academic-level-id') ?? undefined,
            academicLevel: {
                name: searchParams.get('academic-level-name') ?? undefined,
            },
            educationLevelId: searchParams.get('education-level-id') ?? undefined,
            educationLevel: {
                name: searchParams.get('education-level-name') ?? undefined,
            }
        }
    });
    const selectedAcademicLevel = watch('academicLevelId');
    const selectedEducationLevel = watch('educationLevelId');

    // Academic levels states
    const [academicLevelsQuery, setAcademicLevelsQuery] = useState<string>("");
    const { data: academicLevels, isFetching: isFetchingAcademicLevels } = useAcademicLevelForSchoolSubject(academicLevelsQuery);

    // Education levels state
    const [educationLevelsQuery, setEducationLevelsQuery] = useState<string>("");
    const { data: educationLevels, isFetching: isFetchingEducationLevels } = useEducationLevelForSchoolSubject(`${selectedAcademicLevel}`, educationLevelsQuery);

    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete('query');
        searchParams.delete('status');
        searchParams.delete('academic-level-id');
        searchParams.delete('academic-level-name');
        searchParams.delete('education-level-id');
        searchParams.delete('education-level-name');
        reset({
            name: '',
            status: true,
            academicLevelId: undefined,
            academicLevel: {
                name: undefined
            },
            educationLevelId: undefined,
            educationLevel: {
                name: undefined
            }
        });
        setSearchParams(searchParams);
        handleOnClearSelectionForAcademicLevel();
    }

    const handleSubmitForm = (schoolSubjectLike: Partial<SchoolSubject>) => {
        schoolSubjectLike.status ? searchParams.set('status', `${schoolSubjectLike.status}`) : searchParams.delete('status');
        schoolSubjectLike.name ? searchParams.set('query', schoolSubjectLike.name) : searchParams.delete('query');

        schoolSubjectLike.academicLevelId ? searchParams.set('academic-level-id', schoolSubjectLike.academicLevelId) : searchParams.delete('academic-level-id');
        schoolSubjectLike.academicLevel?.name ? searchParams.set('academic-level-name', schoolSubjectLike.academicLevel.name) : searchParams.delete('academic-level-name');

        schoolSubjectLike.educationLevelId ? searchParams.set('education-level-id', schoolSubjectLike.educationLevelId) : searchParams.delete('education-level-id');
        schoolSubjectLike.educationLevel?.name ? searchParams.set('education-level-name', schoolSubjectLike.educationLevel?.name) : searchParams.delete('education-level-name');
        
        setSearchParams(searchParams);
        handleClickClose();
    }

    const handleOnSearchForAcademicLevel = (query: string) => {
        queryClient.removeQueries({ queryKey: [GET_ACADEMIC_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY, academicLevelsQuery] });
        queryClient.setQueryData([GET_ACADEMIC_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY, academicLevelsQuery], []);
        setAcademicLevelsQuery(query);
    }

    const handleOnOptionChangeForAcademicLevel = (option: AcademicLevel) => {
        // Clear data from useQuery
        queryClient.setQueryData([GET_ACADEMIC_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY, academicLevelsQuery], []);
        setValue('academicLevelId', option.id);
        setValue('academicLevel.name', option.name);
    }

    const handleOnClearSelectionForAcademicLevel = () => {
        queryClient.setQueryData([GET_ACADEMIC_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY, academicLevelsQuery], []);
        setValue('academicLevelId', undefined);
        setValue('academicLevel.name', undefined);
        setEducationLevelsQuery("");
        handleOnClearSelectionForEducationLevel();
    }

    const handleOnSearchForEducationLevel = async (query: string) => {
        queryClient.removeQueries({ queryKey: [GET_EDUCATION_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY, `${selectedAcademicLevel}`, educationLevelsQuery] });
        queryClient.setQueryData([GET_EDUCATION_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY, `${selectedAcademicLevel}`, educationLevelsQuery], []);
        setEducationLevelsQuery(query);
    }

    const handleOnOptionChangeForEducationLevel = (option: EducationLevel) => {
        // Clear data from useQuery
        queryClient.setQueryData([GET_EDUCATION_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY, `${selectedAcademicLevel}`, educationLevelsQuery], []);
        setValue('educationLevelId', option.id);
        setValue('educationLevel.name', option.name);
    }

    const handleOnClearSelectionForEducationLevel = () => {
        queryClient.setQueryData([GET_EDUCATION_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY, `${selectedAcademicLevel}`, educationLevelsQuery], []);
        setValue('educationLevelId', undefined);
        setValue('educationLevel.name', undefined);
        setEducationLevelsQuery("");
    }

    return (
        <>
            <form onSubmit={handleSubmit(handleSubmitForm)} className="fixed inset-0 z-50 flex justify-end" data-testid="filter-drawer">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClickClose} />
                <aside className="relative box-border bg-card w-full max-w-md h-full border-l border-border shadow-2xl flex flex-col animate-slide-in-right">
                    <div className="h-22 flex items-center justify-between px-10 border-b border-border">
                        <h3 className="font-heading text-xl font-bold uppercase">
                            {title}
                        </h3>
                        <Button onClick={handleClickClose} data-testid="filter-drawer-close" className="min-w-8 min-h-8 bg-white text-foreground">
                            <X className="w-8 h-8" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-10 py-10 space-y-5">

                        {/* Contenido de filtrados */}
                        <div className="flex flex-col gap-8">
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Nombre:</label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        {...register('name')}
                                        placeholder="Nombre de la materia escolar..."
                                        className="pill-input w-full pl-8"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Nivel académico:</label>
                                <CustomSearchInput
                                    defaultValue={watch('academicLevel.name')}
                                    selected={!!selectedAcademicLevel}
                                    placeholder="Busqueda de nivel acádemico"
                                    options={academicLevels?.data ?? []}
                                    isSearching={isFetchingAcademicLevels}
                                    onClearSelection={handleOnClearSelectionForAcademicLevel}
                                    onOptionChange={handleOnOptionChangeForAcademicLevel}
                                    onSearch={handleOnSearchForAcademicLevel}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Nivel educativo:</label>
                                <CustomSearchInput
                                    defaultValue={watch('educationLevel.name')}
                                    selected={!!selectedEducationLevel}
                                    disabled={!selectedAcademicLevel}
                                    placeholder="Busqueda de nivel educativo"
                                    options={educationLevels?.data ?? []}
                                    isSearching={isFetchingEducationLevels}
                                    onClearSelection={handleOnClearSelectionForEducationLevel}
                                    onOptionChange={handleOnOptionChangeForEducationLevel}
                                    onSearch={handleOnSearchForEducationLevel}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Estatus:</label>
                                <Switch
                                    size="default"
                                    checked={watch('status')}
                                    onCheckedChange={(checked) => setValue('status', checked)} />
                            </div>
                        </div>
                    </div>
                    <div className="px-8 py-6 border-t border-border flex items-center justify-between gap-3 box-border">
                        <Button
                            type="button"
                            variant={"destructive"}
                            data-testid="filter-clear-button"
                            className="pill-btn-outline px-10"
                            onClick={handleClickClearFilters}>
                            Limpiar filtros
                        </Button>
                        <Button
                            type="submit"
                            data-testid="filter-apply-button"
                            className="pill-btn-primary px-10">
                            Aplicar filtros
                        </Button>
                    </div>
                </aside>
            </form>
        </>
    );
}