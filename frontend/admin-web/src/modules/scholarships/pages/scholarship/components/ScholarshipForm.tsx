import { useNavigate } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/shadcn/ui/input";
import { Switch } from "@/shared/shadcn/ui/switch";
import { Slider } from "@/shared/shadcn/ui/slider";
import { Textarea } from "@/shared/shadcn/ui/textarea";
import { Form } from "@/shared/components/form/Form";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { ScholarshipRequest } from "@/interfaces/requests/scholarship.request";
import type { ScholarshipResponse } from "@/interfaces/responses/scholarship.response";

interface Props {
    isSubmitting: boolean,
    scholarshipResponse?: ScholarshipResponse,
    onSubmit: (scholarshipRequestLike: Partial<ScholarshipRequest>) => void
}

export const ScholarshipForm = ({ scholarshipResponse, isSubmitting, onSubmit }: Props) => {
    // Component hooks & stores
    const navigate = useNavigate();
    const { control, handleSubmit, formState: { errors }, watch } = useForm<Partial<ScholarshipRequest>>({
        defaultValues: {
            name: isValidValueWithDefault(scholarshipResponse?.name, ""),
            isActive: isValidValueWithDefault(scholarshipResponse?.isActive, false),
            discountPercentage: isValidValueWithDefault(scholarshipResponse?.discountPercentage, 1),
            description: isValidValueWithDefault(scholarshipResponse?.description, ""),
        }
    });
    const discountPercentage = watch("discountPercentage");

    return (
        <>
            <Form moduleKey="scholarships" isSubmitting={isSubmitting} onSubmit={handleSubmit(onSubmit)} onCancel={() => navigate("/scholarships")}>

                <section className="flex flex-col gap-y-6">

                    <SectionTitle
                        title="INFORMACIÓN GENERAL DE LA BECA ESCOLAR"
                        description="Registro de información básica de la beca escolar disponible para los estudiantes." />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        <div className="control-container">
                            <label className="label">Nombre de la beca escolar <span className="required">*</span>:</label>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        placeholder="Nombre de la beca escolar..."
                                    />
                                )} />
                            {
                                errors.name && (
                                    <p className="error">
                                        El nombre de la beca escolar es obligatoria
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Porcentaje de descuento ({discountPercentage ?? 1} %):</label>
                            <Controller
                                name="discountPercentage"
                                control={control}
                                render={({ field }) => (
                                    <div className="flex items-center justify-center mt-0 md:mt-7">
                                        <Slider
                                            value={field.value ?? 1}
                                            min={1}
                                            max={100}
                                            step={1}
                                            onValueChange={(value) => field.onChange(value, { shouldTouch: true })}
                                        />
                                    </div>
                                )}
                            />
                        </div>

                        <div className="control-container col-span-2">
                            <label className="label">¿Registro activo?:</label>
                            <div className="flex items-center justify-center">
                                <Controller
                                    name="isActive"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="switch-control-container">
                                            <div>
                                                <p className="label">{field.value ? "Activo" : "Inactivo"}</p>
                                                <p className="description">La beca escolar se encuentra activa o inactiva.</p>
                                            </div>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </label>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="control-container col-span-2">
                            <label className="label">Descripción de la beca escolar:</label>
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
                            {
                                errors.description && (
                                    <p className="error">
                                        La descripción de la beca escolar es obligatorio
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
