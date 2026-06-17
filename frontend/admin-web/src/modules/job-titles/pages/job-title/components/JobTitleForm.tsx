import { useEffect } from "react"
import { Link } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { CustomSpinner } from "@/shared/components/CustomSpinner";
import type { JobTitleTypes } from "@/interfaces/entites/job-title"
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { JobTitleRequest } from "@/interfaces/requests/job-title.request";
import type { JobTitleResponse } from "@/interfaces/responses/job-title.response";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface Props {
    isSubmitting: boolean,
    jobTitleResponse?: JobTitleResponse,
    onSubmit: (jobTitleRequestLike: Partial<JobTitleRequest>) => void
}

export const JobTitleForm = ({ jobTitleResponse, isSubmitting, onSubmit }: Props) => {
    // Use react hook form configuration
    const { control, handleSubmit, formState: { errors }, watch, reset } = useForm<Partial<JobTitleRequest>>({
        defaultValues: {
            name: isValidValueWithDefault(jobTitleResponse?.name, ""),
            description: isValidValueWithDefault(jobTitleResponse?.description, ""),
            isActive: isValidValueWithDefault(jobTitleResponse?.isActive, false),
            jobTitleType: isValidValueWithDefault(jobTitleResponse?.jobTitleType as JobTitleTypes, undefined)
        }
    });

    useEffect(() => {
        requestAnimationFrame(() => {
            reset({
                name: isValidValueWithDefault(jobTitleResponse?.name, ""),
                description: isValidValueWithDefault(jobTitleResponse?.description, ""),
                isActive: isValidValueWithDefault(jobTitleResponse?.isActive, false),
                jobTitleType: isValidValueWithDefault(jobTitleResponse?.jobTitleType as JobTitleTypes, undefined)
            });
        });
    }, [jobTitleResponse])

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6">

                {/* General section */}
                <SectionTitle
                    title="INFORMACIÓN GENERAL DEL PUESTO DE TRABAJO"
                    description="Registro de información básica del puesto de trabajo en la organización." />

                <section className="flex items-center flex-col gap-8">

                    <section className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="control-container">
                            <label className="label">Nombre del puesto de trabajo <span className="required">*</span>:</label>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        value={watch(field.name) ?? ""}
                                        onChange={field.onChange}
                                        type="text"
                                        placeholder="Nombre del puesto de trabajo..."
                                    />
                                )} />
                            {
                                errors.name && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El nombre del puesto de trabajo es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Tipo de puesto de trabajo <span className="required">*</span>:</label>
                            <Controller
                                control={control}
                                name="jobTitleType"
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Select
                                        value={watch(field.name) ?? ""}
                                        onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecciona un puesto de trabajo">
                                                {watch(field.name) === "teacher" && "Docente"}
                                                {watch(field.name) === "administrative-staff" && "Administrativo"}
                                                {!watch(field.name) && "Selecciona una opción"}
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
                    </section>

                    <div className="control-container">
                        <label className="label">¿Registro activo?:</label>
                        <div className="flex items-center justify-center">
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-transparent dark:bg-muted/40 border border-border cursor-pointer transition-colors">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{watch(field.name) ? "Activo" : "Inactivo"}</p>
                                            <p className="text-xs text-muted-foreground mt-1">El puesto de trabajo se encuentra activo o inactivo.</p>
                                        </div>
                                        <Switch checked={watch(field.name)} onCheckedChange={field.onChange} />
                                    </label>
                                )}
                            />
                        </div>
                    </div>

                    <div className="control-container">
                        <label className="label">Descripción del puesto de trabajo:</label>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    value={watch(field.name) ?? ""}
                                    onChange={field.onChange}
                                    placeholder="-"
                                />
                            )}
                        />
                    </div>

                </section>

                {/* Actions Buttons */}
                <section className="flex items-center justify-end mt-8 gap-x-4 border-t border-border pt-8">
                    <Link to="/job-titles">
                        <Button type="button" disabled={isSubmitting} aria-label="cancel" variant={"ghost"}>
                            Cancelar
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting} aria-label="save-record">
                        Guardar
                        {
                            isSubmitting && (<CustomSpinner variant="primary" className="ml-4" />)
                        }
                    </Button>
                </section>

            </form>
        </>
    )
}
