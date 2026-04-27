import { useEffect } from 'react'
import { Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { Textarea } from '@/shared/ui/textarea';
import { CustomSpinner } from '@/shared/components/CustomSpinner';
import type { SchoolSubject } from '@/interfaces/entites/school-subject'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

interface Props {
    schoolSubject?: SchoolSubject,
    isSubmitting: boolean,
    onSubmit: (schoolSubjectLike: Partial<SchoolSubject>) => void
}

export const SchoolSubjectForm = ({ schoolSubject, isSubmitting, onSubmit }: Props) => {

    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, getValues, setValue, watch, reset } = useForm<Partial<SchoolSubject>>({
        defaultValues: schoolSubject
    });

    useEffect(() => {
        if (schoolSubject)
            reset(schoolSubject);
    }, [schoolSubject])

    const handleClickCancel = () => {
        navigate('/school-subjects');
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
                        <label className="text-sm font-medium text-foreground mb-3 block">
                            Nivel académico <span className="text-destructive">*</span>:
                        </label>
                        <Select onValueChange={(value) => setValue('academicLevelId', '')} value={watch('academicLevelId')}>
                            <SelectTrigger className="pill-input w-full pl-8">
                                <SelectValue placeholder="Selecciona un nivel académico" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Primaria</SelectItem>
                                <SelectItem value="2">Secundaria</SelectItem>
                                <SelectItem value="3">Bachillerato</SelectItem>
                                <SelectItem value="4">Profesional</SelectItem>
                                <SelectItem value="5">Preescolar</SelectItem>
                                <SelectItem value="6">Educación especial</SelectItem>
                                <SelectItem value="7">Educación de adultos</SelectItem>
                                <SelectItem value="8">Diplomado</SelectItem>
                                <SelectItem value="9">Postgrado</SelectItem>
                                <SelectItem value="10">Maestría</SelectItem>
                            </SelectContent>
                        </Select>
                        {
                            errors.academicLevelId && (
                                <p className="text-red-500 text-sm mt-2">
                                    El nivel académico es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-3 block">
                            Grado educativo <span className="text-destructive">*</span>:
                        </label>
                        <Select onValueChange={(value) => setValue('educationLevelId', '')} value={watch('educationLevelId')}>
                            <SelectTrigger className="pill-input w-full pl-8">
                                <SelectValue placeholder="Selecciona un grado educativo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1-1">1er Grado</SelectItem>
                                <SelectItem value="1-2">2do Grado</SelectItem>
                                <SelectItem value="1-3">3er Grado</SelectItem>
                                <SelectItem value="1-4">4to Grado</SelectItem>
                                <SelectItem value="1-5">5to Grado</SelectItem>
                                <SelectItem value="1-6">6to Grado</SelectItem>
                                <SelectItem value="2-1">1er Año</SelectItem>
                                <SelectItem value="2-2">2do Año</SelectItem>
                                <SelectItem value="2-3">3er Año</SelectItem>
                                <SelectItem value="3-1">4to Año</SelectItem>
                                <SelectItem value="3-2">5to Año</SelectItem>
                                <SelectItem value="3-3">6to Año</SelectItem>
                                <SelectItem value="4-1">Técnico</SelectItem>
                                <SelectItem value="4-2">Tecnólogo</SelectItem>
                                <SelectItem value="4-3">Profesional</SelectItem>
                                <SelectItem value="5-1">Preparatorio</SelectItem>
                                <SelectItem value="5-2">Jardín</SelectItem>
                                <SelectItem value="7-1">Alfabetización</SelectItem>
                                <SelectItem value="7-2">Secundaria para Adultos</SelectItem>
                                <SelectItem value="9-1">Especialización</SelectItem>
                                <SelectItem value="9-2">Maestría</SelectItem>
                                <SelectItem value="9-3">Doctorado</SelectItem>
                                <SelectItem value="10-1">Maestría en Ciencias</SelectItem>
                                <SelectItem value="10-2">Maestría en Humanidades</SelectItem>
                            </SelectContent>
                        </Select>
                        {
                            errors.educationLevelId && (
                                <p className="text-red-500 text-sm mt-2">
                                    El grado educativo es obligatorio
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