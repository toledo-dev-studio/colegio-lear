import { useEffect } from 'react'
import { Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Switch } from '@/shared/ui/switch';
import { Textarea } from '@/shared/ui/textarea';
import { CustomSpinner } from '@/shared/components/CustomSpinner';
import type { AcademicLevel } from '@/interfaces/entites/academic-level'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { EducationLevelGrid, type AvailableEducationLevel } from './EducationLevelGrid';

interface Props {
    academicLevel?: AcademicLevel,
    isSubmitting: boolean,
    onSubmit: (academicLevelLike: Partial<AcademicLevel>) => void
}

export const AcademicLevelForm = ({ academicLevel, isSubmitting, onSubmit }: Props) => {

    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors }, getValues, setValue, watch, reset } = useForm<Partial<AcademicLevel>>({
        defaultValues: academicLevel
    });

    const educationLevels = watch('educationLevels') as AvailableEducationLevel[];

    const handleAddEducationLevel = () => {
        const current = (getValues('educationLevels') ?? [])
            .map((item) => ({ ...item, isEditing: false })) as AvailableEducationLevel[]; // Cerramos los formularios
        const newElement: AvailableEducationLevel = {
            id: `new-${current.length + 1}`,
            name: `Grado educativo - ${current.length + 1}`,
            description: '',
            isEditing: true,
            academicLevelId: getValues('id') ?? 'new'
        };
        setValue('educationLevels', [...current, newElement]);
    }

    const handleRemoveEducationLevel = (id: string) => {
        const current = (getValues('educationLevels') ?? [])
            .map((item) => ({ ...item, isEditing: false }))
            .filter((item) => item.id !== id) as AvailableEducationLevel[]; // Cerramos los formularios;
        setValue('educationLevels', current);
    }

    const handleToggleEditEducationLevel = (id: string, isEditing: boolean) => {
        if (isEditing) {
            const current = (getValues('educationLevels') ?? [])
                .map((item) => ({ ...item, isEditing: item.id === id })) as AvailableEducationLevel[]; // Cerramos los formularios
            setValue('educationLevels', current);
        } else {
            const current = (getValues('educationLevels') ?? [])
                .map((item) => ({ ...item, isEditing: false })) as AvailableEducationLevel[]; // Cerramos los formularios
            setValue('educationLevels', current);
        }
    }

    const handleChangeEducationLevel = (id: string, field: 'name' | 'description', value: string) => {
        const current = (getValues('educationLevels') ?? []) as AvailableEducationLevel[];
        setValue('educationLevels', current.map((grade) =>
            grade.id === id ? { ...grade, [field]: value } : grade
        ));
    }

    useEffect(() => {
        if (academicLevel)
            reset(academicLevel);
    }, [academicLevel])

    const handleClickCancel = () => {
        navigate('/academic-levels');
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
                            Nombre del nivel académico <span className="text-destructive">*</span>:
                        </label>
                        <Input
                            type="text"
                            {...register('name', { required: true })}
                            placeholder="Escribe el nivel académico..."
                            className="pill-input w-full pl-8" />
                        {
                            errors.name && (
                                <p className="text-red-500 text-sm mt-2">
                                    El nombre del nivel académico es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-3 block">Descripción del nivel académico:</label>
                        <Textarea
                            {...register('description')}
                            defaultValue={getValues('description')}
                            placeholder="Descripción del nivel académico..."
                            className="pill-input w-full pl-8" />
                    </div>

                </div>

                {/* Creación de grados disponibles */}
                <h2 className="w-full text-muted-foreground border-b border-border pb-4 mt-4">
                    INFORMACIÓN DE GRADOS ESCOLARES DISPONIBLES
                </h2>

                <EducationLevelGrid 
                    educationLevels={educationLevels} 
                    handleAddEducationLevel={handleAddEducationLevel} 
                    handleChangeEducationLevel={handleChangeEducationLevel} 
                    handleRemoveEducationLevel={handleRemoveEducationLevel} 
                    handleToggleEditEducationLevel={handleToggleEditEducationLevel}
                />


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
