import { Link } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Slider } from "@/shared/ui/slider";
import { Textarea } from "@/shared/ui/textarea";
import { Spinner } from "@/shared/components/spinner/Spinner";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { ScholarshipRequest } from "@/interfaces/requests/scholarship.request";
import type { ScholarshipResponse } from "@/interfaces/responses/scholarship.response";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";

interface Props {
    isSubmitting: boolean,
    scholarshipResponse?: ScholarshipResponse,
    onSubmit: (scholarshipRequestLike: Partial<ScholarshipRequest>) => void
}

export const ScholarshipForm = ({ scholarshipResponse, isSubmitting, onSubmit }: Props) => {

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
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6">

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

                    <div className="control-container">
                        <label className="label">¿Registro activo?:</label>
                        <div className="flex items-center justify-center">
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-transparent dark:bg-muted/40 border border-border cursor-pointer transition-colors">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{field.value ? "Activo" : "Inactivo"}</p>
                                            <p className="text-xs text-muted-foreground mt-1">La beca escolar se encuentra activa o inactiva.</p>
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

                {/* Actions Buttons */}
                <section className="flex items-center justify-end mt-8 gap-x-4 border-t border-border pt-8">
                    <Link to="/scholarships">
                        <Button type="button" disabled={isSubmitting} aria-label="cancel" variant={"ghost"}>
                            Cancelar
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting} aria-label="save-record">
                        Guardar
                        {
                            isSubmitting && (<Spinner variant="primary" className="ml-4" />)
                        }
                    </Button>
                </section>

            </form>
        </>
    )
}
