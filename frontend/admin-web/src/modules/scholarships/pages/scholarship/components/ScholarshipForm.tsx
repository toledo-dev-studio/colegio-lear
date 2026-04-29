import { useEffect } from "react";
import { Save, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { CustomSpinner } from "@/shared/components/CustomSpinner";
import type { Scholarship } from "@/interfaces/entites/scholarship"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

interface Props {
    scholarship?: Scholarship,
    isSubmitting: boolean,
    onSubmit: (scholarshipLike: Partial<Scholarship>) => void
}

export const ScholarshipForm = ({ scholarship, isSubmitting, onSubmit }: Props) => {

    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        setValue,
        watch,
        reset
    } = useForm<Partial<Scholarship>>({
        defaultValues: scholarship
    });

    useEffect(() => {
        if (scholarship)
            reset(scholarship);
    }, [scholarship])

    const handleClickCancel = () => {
        navigate('/scholarships');
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6">

                <div className="flex flex-col items-start gap-y-4 md:items-center md:flex-row md:justify-between border-b border-border pb-4">
                    <h2 className="w-full text-muted-foreground">
                        INFORMACIÓN GENERAL DE LA BECA ESCOLAR
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

                    <div className="w-full flex md:flex-row flex-col gap-y-8 gap-x-8">
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Nombre de la beca escolar <span className="text-destructive">*</span>:
                            </label>
                            <Input
                                type="text"
                                {...register('name', { required: true })}
                                placeholder="Nombre de la beca escolar..."
                                className="pill-input w-full pl-8" />
                            {
                                errors.name && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El nombre de la beca escolar es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">Porcentaje de descuento ({watch('discountPercentage') ?? 1} %) <span className="text-destructive">*</span>:</label>
                            <div className="flex items-center justify-center mt-0 md:mt-7.5">
                                <Slider
                                    value={getValues('discountPercentage') ?? 1}
                                    min={1}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) => setValue('discountPercentage', +value)}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-3 block">Descripción de la beca escolar:</label>
                        <Textarea
                            {...register('description')}
                            defaultValue={getValues('description')}
                            placeholder="Descripción de la beca escolar..."
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
