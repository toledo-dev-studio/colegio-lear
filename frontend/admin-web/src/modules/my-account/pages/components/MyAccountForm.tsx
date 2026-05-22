import { Briefcase, Key, Mail, Phone, Save, User } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Controller, useForm } from "react-hook-form";
import { isValidPhone } from "@/lib/extensions/validators";
import type { Employee } from "@/interfaces/entites/employee";
import { CustomSpinner } from "@/shared/components/CustomSpinner";
import { CustomPhotoUploader } from "@/shared/components/CustomPhotoUploader";
import type { EmployeeFormData } from "@/modules/employees/interfaces/employee-form";
import { DEFAULT_IMAGE_EXTENSIONS, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants/attachment.constants";
import { extractFileExtension } from "@/lib/extensions/attachments";

interface Props {
    employee?: Employee,
    isSubmitting: boolean,
    onSubmit: (employeeLike: Partial<EmployeeFormData>) => Promise<void>
}

export const MyAccountForm = ({ employee, isSubmitting, onSubmit }: Props) => {

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Partial<EmployeeFormData>>({
        defaultValues: employee!,
        mode: "onChange"
    });

    return (
        <>
            <form className="flex flex-col min-h-full gap-8 mt-14" onSubmit={handleSubmit(onSubmit)}>

                {/* Photo uploader */}
                <section className="flex items-center justify-center flex-col">
                    <Controller
                        name="file"
                        control={control}
                        rules={{
                            validate: {
                                maxSize: (file) => !file ? true : file!.size <= MAX_IMAGE_SIZE_BYTES || "El tamaño de la imagen debe ser menor o igual a 5MB",
                                validFormat: (file) => !file ? true : DEFAULT_IMAGE_EXTENSIONS.includes(`.${extractFileExtension(file!.name)}`) || "El formato seleccionado no es un válido"
                            }
                        }}
                        render={({ field, fieldState }) => (
                            <>
                                <div className="w-full flex flex-col items-center justify-center">
                                    <CustomPhotoUploader
                                        value={field.value ? URL.createObjectURL(field.value) : (employee?.image ?? undefined)}
                                        changedImage={field.value && fieldState.isTouched}
                                        onChange={(file) => {
                                            field.onChange(file);
                                            field.onBlur();
                                        }} />
                                    {
                                        errors.file && (
                                            <p className="text-red-500 text-center text-sm mt-2">
                                                {errors.file.message}
                                            </p>
                                        )
                                    }
                                </div>
                            </>
                        )}
                    />
                </section>

                {/* Main employee information */}
                <section className="flex flex-col gap-y-6">
                    <div className="flex flex-col items-start gap-y-4 md:items-center md:flex-row md:justify-between border-b border-border pb-4">
                        <h2 className="w-full text-muted-foreground">
                            INFORMACIÓN GENERAL DEL EMPLEADO
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Nombre <span className="text-destructive">*</span>:
                            </label>
                            <Input
                                type="text"
                                {...register("name", { required: true })}
                                placeholder="Nombre"
                                className="pill-input w-full pl-8" />
                            {
                                errors.name && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El nombre del empleado es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Apellido paterno: <span className="text-destructive">*</span>:
                            </label>
                            <Input
                                type="text"
                                {...register("firstLastName", { required: true })}
                                placeholder="Apellido paterno"
                                className="pill-input w-full pl-8" />
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Apellido materno:
                            </label>
                            <Input
                                type="text"
                                {...register("secondLastName")}
                                placeholder="Apellido materno"
                                className="pill-input w-full pl-8" />
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Número de teléfono<span className="text-destructive">*</span>:
                            </label>
                            <div className="relative">
                                <Phone className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    {...register("phoneNumber", { required: true, validate: (value) => isValidPhone(value) })}
                                    placeholder="+52 (55) 1234-5678"
                                    maxLength={10}
                                    className="pill-input w-full pl-8 pr-13" />
                            </div>
                            {
                                errors.phoneNumber && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {errors.phoneNumber.message || "El número de teléfono del empleado es obligatorio"}
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Correo electrónico:
                            </label>
                            <div className="relative">
                                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    value={employee?.email}
                                    disabled
                                    placeholder="usuario@dominio.com"
                                    className="pill-input w-full pl-8 pr-13" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="flex flex-col gap-y-6">
                    <div className="flex flex-col items-start gap-y-4 md:items-center md:flex-row md:justify-between border-b border-border pb-4">
                        <h2 className="w-full text-muted-foreground">
                            INFORMACIÓN ADICIONAL
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Nombre de usuario:
                            </label>
                            <div className="relative">
                                <User className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={employee?.username}
                                    disabled
                                    placeholder="usuario"
                                    className="pill-input w-full pl-8 pr-13" />
                            </div>
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Rol de seguridad:
                            </label>
                            <div className="relative">
                                <Key className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={employee?.securityRole?.name}
                                    disabled
                                    placeholder="Rol de seguridad asignado"
                                    className="pill-input w-full pl-8 pr-13" />
                            </div>
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Puesto de trabajo:
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={employee?.jobTitle?.name}
                                    disabled
                                    placeholder="Puesto de trabajo asignado"
                                    className="pill-input w-full pl-8 pr-13" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Actions Buttons */}
                <div className="flex items-center justify-end mt-8 gap-x-6">
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
