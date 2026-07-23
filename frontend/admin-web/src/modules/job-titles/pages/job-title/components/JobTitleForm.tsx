import { useNavigate } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Textarea } from "@/shared/ui/textarea";
import { Form } from "@/shared/components/form/Form";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { JobTitleRequest } from "@/interfaces/requests/job-title.request";
import type { JobTitleResponse } from "@/interfaces/responses/job-title.response";
import type { JobTitleTypeKey } from "@/lib/key-value-pairs/key-value-pair-types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface Props {
    isSubmitting: boolean,
    jobTitleResponse?: JobTitleResponse,
    onSubmit: (jobTitleRequestLike: Partial<JobTitleRequest>) => void
}

export const JobTitleForm = ({ jobTitleResponse, isSubmitting, onSubmit }: Props) => {
    // Component hooks & stores
    const navigate = useNavigate();

    // Use react hook form configuration
    const { control, handleSubmit, formState: { errors } } = useForm<Partial<JobTitleRequest>>({
        defaultValues: {
            name: isValidValueWithDefault(jobTitleResponse?.name, ""),
            description: isValidValueWithDefault(jobTitleResponse?.description, ""),
            isActive: isValidValueWithDefault(jobTitleResponse?.isActive, false),
            jobTitleType: isValidValueWithDefault(jobTitleResponse?.jobTitleType as JobTitleTypeKey, undefined)
        }
    });

    return (
        <>
            <Form moduleKey="job-titles" isSubmitting={isSubmitting} onSubmit={handleSubmit(onSubmit)} onCancel={() => navigate("/job-titles")}>

                <section className="flex flex-col gap-y-6">

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
                                            type="text"
                                            placeholder="Nombre del puesto de trabajo..."
                                        />
                                    )} />
                                {
                                    errors.name && (
                                        <p className="error">
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
                                            value={field.value ?? ""}
                                            onValueChange={field.onChange}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Selecciona un puesto de trabajo">
                                                    {field.value === "teacher" && "Docente"}
                                                    {field.value === "administrative-staff" && "Administrativo"}
                                                    {!field.value && "Selecciona una opción"}
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
                                    )}
                                />
                                {
                                    errors.jobTitleType && (
                                        <p className="error">
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
                                        <label className="switch-control-container">
                                            <div>
                                                <p className="label">{field.value ? "Activo" : "Inactivo"}</p>
                                                <p className="description">El puesto de trabajo se encuentra activo o inactivo.</p>
                                            </div>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                                        placeholder="-"
                                    />
                                )}
                            />
                        </div>

                    </section>

                </section>

            </Form>
        </>
    )
}
