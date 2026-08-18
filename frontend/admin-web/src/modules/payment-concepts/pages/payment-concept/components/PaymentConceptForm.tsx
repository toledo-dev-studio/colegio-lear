import { useNavigate } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { Banknote } from "lucide-react";

import { Input } from "@/shared/shadcn/ui/input";
import { Switch } from "@/shared/shadcn/ui/switch";
import { Textarea } from "@/shared/shadcn/ui/textarea";
import { Form } from "@/shared/components/form/Form";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { PaymentConceptRequest } from "@/interfaces/requests/payment-concept.request";
import type { PaymentConceptResponse } from "@/interfaces/responses/payment-concept.response";

interface Props {
    isSubmitting: boolean,
    paymentConceptResponse?: PaymentConceptResponse,
    onSubmit: (paymentConceptRequestLike: Partial<PaymentConceptRequest>) => void
}

export const PaymentConceptForm = ({ paymentConceptResponse, isSubmitting, onSubmit }: Props) => {
    // Component hooks & stores
    const navigate = useNavigate();
    const { control, handleSubmit, formState: { errors } } = useForm<Partial<PaymentConceptRequest>>({
        defaultValues: {
            name: isValidValueWithDefault(paymentConceptResponse?.name, ""),
            code: isValidValueWithDefault(paymentConceptResponse?.code, ""),
            isActive: isValidValueWithDefault(paymentConceptResponse?.isActive, false),
            amount: isValidValueWithDefault(paymentConceptResponse?.amount, 1),
            description: isValidValueWithDefault(paymentConceptResponse?.description, ""),
            allowForgiveness: isValidValueWithDefault(paymentConceptResponse?.allowForgiveness, false),
        }
    });

    return (
        <>
            <Form moduleKey="payment-concepts" isSubmitting={isSubmitting} onSubmit={handleSubmit(onSubmit)} onCancel={() => navigate("/payment-concepts")}>

                <section className="flex flex-col gap-y-6">

                    <SectionTitle
                        title="INFORMACIÓN GENERAL DEL CONCEPTO DE PAGO"
                        description="Registro de información básica del concepto de pago así como de montos y condonaciones." />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        <div className="control-container">
                            <label className="label">Nombre del concepto de pago <span className="required">*</span>:</label>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        placeholder="Nombre del concepto de pago..."
                                    />
                                )} />
                            {
                                errors.name && (
                                    <p className="error">
                                        El nombre del concepto de pago es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Código del concepto de pago <span className="required">*</span>:</label>
                            <Controller
                                name="code"
                                control={control}
                                disabled={!!paymentConceptResponse?.id}
                                rules={{
                                    required: "El código del concepto de pago es obligatorio",
                                    pattern: {
                                        value: /^[A-Za-z0-9_-]+$/,
                                        message: "Solo se permiten letras, números, guiones y guiones bajos"
                                    }
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        placeholder="Código del concepto de pago..."
                                        onKeyDown={(e) => {
                                            if (!/^[A-Za-z0-9_-]$/.test(e.key) &&
                                                ![
                                                    "Backspace",
                                                    "Delete",
                                                    "ArrowLeft",
                                                    "ArrowRight",
                                                    "Tab",
                                                    "Home",
                                                    "End"
                                                ].includes(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        maxLength={10}
                                        disabled={!!paymentConceptResponse?.id}
                                        onChange={(e) => {
                                            field.onChange(
                                                e.target.value
                                                    .toUpperCase()
                                                    .replace(/[^A-Z0-9]/g, "")
                                            );
                                        }}
                                    />
                                )}
                            />
                            {
                                errors.code && (
                                    <p className="error">
                                        {errors.code.message}
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Monto de pago (MXN) <span className="required">*</span>:</label>
                            <Controller
                                name="amount"
                                control={control}
                                rules={{
                                    required: true,
                                    validate: {
                                        integer: (v) => Number.isInteger(v) || "No se permiten decimales",
                                        nonNegative: (v) => v! >= 0 || "El monto de pago no puede ser negativo",
                                    },
                                }}
                                render={({ field }) => (
                                    <div className="relative">
                                        <Banknote className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            {...field}
                                            step={1}
                                            min={1}
                                            inputMode="numeric"
                                            type="number"
                                            placeholder="100"
                                            onKeyDown={(e) => {
                                                if (["e", "E", "+", "-", ".", ","].includes(e.key))
                                                    e.preventDefault();
                                            }}
                                            onChange={(e) => e.target.value ? field.onChange(e.target.valueAsNumber) : field.onChange("")}
                                        />
                                    </div>
                                )}
                            />
                            <p className="control-info">Solo valores enteros — sin decimales</p>
                            {
                                errors.amount && (
                                    <p className="error">
                                        {errors.amount.message || "El monto de pago es obligatorio"}
                                    </p>
                                )
                            }
                        </div>

                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        <div className="control-container">
                            <label className="label">¿Registro activo?:</label>
                            <div className="flex items-center justify-center">
                                <Controller
                                    name="isActive"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="switch-control-container">
                                            <div>
                                                <p className="label">{field.value ? "Activo" : "Inactivo"}</p>
                                                <p className="description">El concepto de pago se encuentra activo o inactivo.</p>
                                            </div>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </label>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="control-container">
                            <label className="label">¿Permitir condonación?:</label>
                            <div className="flex items-center justify-center">
                                <Controller
                                    name="allowForgiveness"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="switch-control-container">
                                            <div>
                                                <p className="label">{field.value ? "Permitido" : "No permitido"}</p>
                                                <p className="description">El concepto de pago permite la condonación del pago.</p>
                                            </div>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </label>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="control-container lg:col-span-2">
                            <label className="label">Descripción del concepto de pago <span className="required">*</span>:</label>
                            <Controller
                                name="description"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        placeholder="-"
                                    />
                                )}
                            />
                            {
                                errors.description && (
                                    <p className="error">
                                        La descripción del concepto de pago es obligatorio
                                    </p>
                                )
                            }
                        </div>

                    </div>

                </section>
            </Form>
        </>
    )
}
