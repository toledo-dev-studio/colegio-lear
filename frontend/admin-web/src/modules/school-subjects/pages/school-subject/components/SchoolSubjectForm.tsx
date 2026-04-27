import { Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { Textarea } from '@/shared/ui/textarea';
import { CustomSpinner } from '@/shared/components/CustomSpinner';
import type { SchoolSubject } from '@/interfaces/entites/school-subject'
import type { AcademicLevel } from '@/interfaces/entites/academic-level';
import { CustomSearchInput } from '@/shared/components/CustomSearchInput';
import type { EducationLevel } from '@/interfaces/entites/education-level';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { useAcademicLevelForSchoolSubject } from '@/modules/school-subjects/hooks/useAcademicLevelForSchoolSubject';
import { useEducationLevelForSchoolSubject } from '@/modules/school-subjects/hooks/useEducationLevelForSchoolSubject';
import { GET_ACADEMIC_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY, GET_EDUCATION_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY } from '@/modules/school-subjects/lib/queries-key';

interface Props {
    schoolSubject?: SchoolSubject,
    isSubmitting: boolean,
    onSubmit: (schoolSubjectLike: Partial<SchoolSubject>) => void
}

export const SchoolSubjectForm = ({ schoolSubject, isSubmitting, onSubmit }: Props) => {

    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors, touchedFields },
        getValues,
        setValue,
        watch,
        reset
    } = useForm<Partial<SchoolSubject>>({
        defaultValues: schoolSubject
    });

    const selectedAcademicLevel = watch('academicLevelId');
    const selectedEducationLevel = watch('educationLevelId');

    // Academic levels states
    const [academicLevelsQuery, setAcademicLevelsQuery] = useState<string>("");
    const { data: academicLevels, isFetching: isFetchingAcademicLevels } = useAcademicLevelForSchoolSubject(academicLevelsQuery);

    // Education levels state
    const [educationLevelsQuery, setEducationLevelsQuery] = useState<string>("");
    const { data: educationLevels, isFetching: isFetchingEducationLevels } = useEducationLevelForSchoolSubject(`${selectedAcademicLevel}`, educationLevelsQuery);

    useEffect(() => {
        if (schoolSubject)
            reset(schoolSubject);
    }, [schoolSubject])

    const handleClickCancel = () => {
        navigate('/school-subjects');
    }

    const handleOnSearchForAcademicLevel = (query: string) => {
        queryClient.removeQueries({ queryKey: [GET_ACADEMIC_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY, academicLevelsQuery] });
        queryClient.setQueryData([GET_ACADEMIC_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY, academicLevelsQuery], []);
        setAcademicLevelsQuery(query);
    }

    const handleOnOptionChangeForAcademicLevel = (option: AcademicLevel) => {
        // Clear data from useQuery
        queryClient.setQueryData([GET_ACADEMIC_LEVELS_FOR_SCHOOL_SUBJECT_QUERY_KEY, academicLevelsQuery], []);
        setValue('academicLevelId', option.id, { shouldTouch: true });
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
        setValue('educationLevelId', option.id, { shouldTouch: true });
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
                                    checked={watch('status') ?? false}
                                    onCheckedChange={(checked) => setValue('status', checked)} />
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
                            {...register('name', { required: true })}
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
                        <label className="text-sm font-medium text-foreground mb-3 block">Descripción de la materia escolar:</label>
                        <Textarea
                            {...register('description')}
                            defaultValue={getValues('description')}
                            placeholder="Descripción de la materia..."
                            className="pill-input w-full pl-8" />
                    </div>

                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-2 block">Nivel académico:</label>
                        <CustomSearchInput
                            {...register('academicLevelId', { required: true })}
                            defaultValue={watch('academicLevel.name')}
                            selected={!!selectedAcademicLevel}
                            placeholder="Busqueda de nivel acádemico"
                            options={academicLevels?.data ?? []}
                            isSearching={isFetchingAcademicLevels}
                            onClearSelection={handleOnClearSelectionForAcademicLevel}
                            onOptionChange={handleOnOptionChangeForAcademicLevel}
                            onSearch={handleOnSearchForAcademicLevel}
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
                        <label className="text-sm font-medium text-foreground mb-2 block">Nivel educativo:</label>
                        <CustomSearchInput
                            {...register('educationLevelId', { required: true })}
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
                        {
                            (errors.educationLevelId && !selectedEducationLevel) && (
                                <p className="text-red-500 text-sm mt-2">
                                    El nivel educativo es obligatorio
                                </p>
                            )
                        }
                    </div>

                </div>

                <div className="flex items-center justify-end mt-8 gap-x-6">
                    <Button type="button" disabled={isSubmitting} aria-label="cancel" variant={"destructive"} onClick={handleClickCancel}>
                        Cancelar
                        <X className="ml-4 w-3 h-3" />
                    </Button>
                    <Button type="submit" disabled={isSubmitting} aria-label="save-record">
                        Guardar datos
                        {
                            isSubmitting ? (<CustomSpinner variant="primary" className="ml-4" />) : <Save className="ml-4 w-3 h-3" />
                        }
                    </Button>
                </div>

            </form>
        </>
    )
}