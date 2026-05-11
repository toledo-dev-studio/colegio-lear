import { useEffect } from 'react'
import { Save, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { Textarea } from '@/shared/ui/textarea';
import { CustomSpinner } from '@/shared/components/CustomSpinner';
import type { JobTitle } from '@/interfaces/entites/job-title.interface'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/shared/ui/select';

interface Props {
    jobTitle?: JobTitle,
    isSubmitting: boolean,
    onSubmit: (jobTitleLike: Partial<JobTitle>) => void
}

export const JobTitleForm = ({ jobTitle, isSubmitting, onSubmit }: Props) => {

    const navigate = useNavigate();
    const { control, register, handleSubmit, formState: { errors }, getValues, setValue, watch, reset } = useForm<Partial<JobTitle>>({
        defaultValues: jobTitle
    });

    useEffect(() => {
        if (jobTitle)
            reset(jobTitle);
    }, [jobTitle])

    const handleClickCancel = () => {
        navigate('/job-titles');
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6">

                <div className="flex flex-col items-start gap-y-4 md:items-center md:flex-row md:justify-between border-b border-border pb-4">
                    <h2 className="w-full text-muted-foreground">
                        INFORMACIÓN GENERAL DEL NIVEL ACADÉMICO
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
                            Nombre del puesto de trabajo <span className="text-destructive">*</span>:
                        </label>
                        <Input
                            type="text"
                            {...register('name', { required: true })}
                            placeholder="Escribe el puesto..."
                            className="pill-input w-full pl-8" />
                        {
                            errors.name && (
                                <p className="text-red-500 text-sm mt-2">
                                    El nombre del puesto de trabajo es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-3 block">
                            Tipo del puesto de trabajo <span className="text-destructive">*</span>:
                        </label>
                        <Controller
                            control={control}
                            name='jobTitleType'
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona un puesto de trabajo">
                                            {field.value === "teacher" ? "Docente" : "Administrativo"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Tipos de puesto de trabajo</SelectLabel>
                                            <SelectItem value="administrative-staff" label="Administrativo">Administrativo</SelectItem>
                                            <SelectItem value="teacher" label="Docente">Docente</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )} />
                        {
                            errors.jobTitleType && (
                                <p className="text-red-500 text-sm mt-2">
                                    El tipo de puesto de trabajo es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-3 block">Descripción del puesto de trabajo:</label>
                        <Textarea
                            {...register('description')}
                            defaultValue={getValues('description')}
                            placeholder="Descripción el puesto..."
                            className="pill-input w-full pl-8" />
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
