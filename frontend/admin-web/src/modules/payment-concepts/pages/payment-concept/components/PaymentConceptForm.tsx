import { useEffect } from 'react';
import { Link } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import { Banknote, Save, X } from 'lucide-react';

import { Input } from '@/shared/ui/input';
import { Switch } from '@/shared/ui/switch';
import { Button } from '@/shared/ui/button';
import { CustomSpinner } from '@/shared/components/CustomSpinner';
import type { PaymentConcept } from '@/interfaces/entites/payment-concept';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { Textarea } from '@/shared/ui/textarea';

interface Props {
    paymentConcept?: PaymentConcept,
    isSubmitting: boolean,
    onSubmit: (paymentConceptLike: Partial<PaymentConcept>) => void
}

export const PaymentConceptForm = ({ paymentConcept, isSubmitting, onSubmit }: Props) => {

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        setValue,
        watch,
        reset
    } = useForm<Partial<PaymentConcept>>({
        defaultValues: paymentConcept
    });

    useEffect(() => {
        if (paymentConcept)
            reset(paymentConcept);
    }, [paymentConcept]);

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6">

                <div className="flex flex-col items-start gap-y-4 md:items-center md:flex-row md:justify-between border-b border-border pb-4">
                    <h2 className="w-full text-muted-foreground">
                        INFORMACIÓN GENERAL DEL CONCEPTO DE PAGO
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

                <div className="grid grid-cols-1 gap-8">
                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-3 block">
                            Nombre del concepto de pago<span className="text-destructive">*</span>:
                        </label>
                        <Input
                            type="text"
                            {...register('name', { required: true })}
                            placeholder="Nombre del concepto de pago..."
                            className="pill-input w-full pl-8" />
                        {
                            errors.name && (
                                <p className="text-red-500 text-sm mt-2">
                                    El nombre del concepto de pago es obligatorio
                                </p>
                            )
                        }
                    </div>
                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-3 block">Descripción del concepto de pago:</label>
                        <Textarea
                            {...register('description')}
                            defaultValue={getValues('description')}
                            placeholder="Descripción del registro..."
                            className="pill-input w-full pl-8" />
                    </div>
                </div>

                <div className="flex flex-col items-start gap-y-4 border-b border-border pb-4 mt-7">
                    <h2 className="w-full text-muted-foreground">
                        DETALLES DE PAGO DEL CONCEPTO DE PAGO
                    </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-3 block">
                            Monto de pago (MXN)<span className="text-destructive">*</span>:
                        </label>
                        <div className="relative">
                            <Banknote className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="number"
                                className="pill-input w-full pl-8 pr-13"
                                step={1}
                                min={1}
                                inputMode="numeric"
                                placeholder="Monto de pago..."
                                onKeyDown={(e) => { if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault(); }}
                                {...register("amount", {
                                    required: true,
                                    valueAsNumber: true,
                                    validate: {
                                        integer: (v) => Number.isInteger(v) || "No se permiten decimales",
                                        nonNegative: (v) => v! >= 1 || "El monto de pago no puede ser menor o igual a 0",
                                    },
                                })}
                            />
                        </div>
                        {
                            errors.amount && (
                                <p className="text-red-500 text-sm mt-2">
                                    {errors.amount.message || 'El monto de pago es obligatorio'}
                                </p>
                            )
                        }
                        <p className="text-xs text-muted-foreground mt-1.5">Solo valores enteros — sin decimales</p>
                    </div>

                    <div className="w-full">
                        <div className="flex items-center justify-center mt-3.5">
                            <Controller
                                name="allowForgiveness"
                                control={control}
                                render={({ field }) => (
                                    <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-muted/40 border border-border cursor-pointer hover:bg-muted/60 transition-colors">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Permitir condonación</p>
                                            <p className="text-xs text-muted-foreground mt-1">El administrador podrá condonar este concepto por alumno según su ciclo escolar.</p>
                                        </div>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </label>
                                )}
                            />
                        </div>
                    </div>
                </div>


                {/* Actions Buttons */}
                <div className="flex items-center justify-end mt-8 gap-x-6">
                    <Link to="/payment-concepts">
                        <Button type="button" disabled={isSubmitting} aria-label="cancel" variant={"destructive"}>
                            Cancelar
                            <X className="ml-4 w-3 h-3" />
                        </Button>
                    </Link>
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
