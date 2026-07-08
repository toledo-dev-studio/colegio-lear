import { Briefcase, Key, Mail, Phone, User } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Controller, useForm } from "react-hook-form";
import { isValidPhone } from "@/lib/extensions/validators";
import { Spinner } from "@/shared/components/spinner/Spinner";
import { extractFileExtension } from "@/lib/extensions/attachments";
import { CustomPhotoUploader } from "@/shared/components/CustomPhotoUploader";
import type { EmployeeRequest } from "@/interfaces/requests/employee.request";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";
import { DEFAULT_IMAGE_EXTENSIONS, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants/attachment.constants";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";

interface Props {
    isSubmitting: boolean;
    employeeResponse?: EmployeeResponse;
    onSubmit: (employeeRequestLike: Partial<EmployeeRequest>) => Promise<void>
}

export const MyAccountForm = ({ employeeResponse, isSubmitting, onSubmit }: Props) => {
    // Component hooks & stores
    const { control, formState: { errors }, handleSubmit } = useForm<Partial<EmployeeRequest>>({
        defaultValues: {
            name: isValidValueWithDefault(employeeResponse?.name, ""),
            firstLastName: isValidValueWithDefault(employeeResponse?.firstLastName, ""),
            secondLastName: isValidValueWithDefault(employeeResponse?.secondLastName, ""),
            phoneNumber: isValidValueWithDefault(employeeResponse?.phoneNumber, ""),
        },
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
                                        value={field.value ? URL.createObjectURL(field.value) : (employeeResponse?.image ?? undefined)}
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

                    <SectionTitle
                        title="INFORMACIÓN GENERAL DE LA CUENTA"
                        description="Consulta y actualiza la información general de tu cuenta." />

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="control-container">
                            <label className="label">Nombre del empleado <span className="required">*</span>:</label>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        placeholder="Nombre del empleado..."
                                    />
                                )}
                            />
                            {
                                errors.name && (
                                    <p className="error">
                                        El nombre del empleado es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Apellido paterno del empleado <span className="required">*</span>:</label>
                            <Controller
                                name="firstLastName"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        placeholder="Apellido paterno del empleado..."
                                    />
                                )}
                            />
                            {
                                errors.name && (
                                    <p className="error">
                                        El apellido paterno del empleado es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Apellido materno del empleado:</label>
                            <Controller
                                name="secondLastName"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        placeholder="Apellido materno del empleado..."
                                    />
                                )}
                            />
                        </div>

                        <div className="control-container">
                            <label className="label">Número de teléfono del empleado <span className="required">*</span>:</label>
                            <Controller
                                name="phoneNumber"
                                control={control}
                                rules={{ required: true, validate: (value) => isValidPhone(value) || "El número de teléfono debe tener al menos 10 dígitos" }}
                                render={({ field }) => (
                                    <div className="relative">
                                        <Phone className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            {...field}
                                            type="number"
                                            placeholder="+52 55-1234-5678" />
                                    </div>
                                )}
                            />
                            {
                                errors.phoneNumber && (
                                    <p className="error">
                                        {errors.phoneNumber.message || "El número de teléfono del empleado es obligatorio"}
                                    </p>
                                )
                            }
                        </div>
                        <div className="control-container">
                            <label className="label">
                                Correo electrónico:
                            </label>
                            <div className="relative">
                                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    value={employeeResponse?.email}
                                    disabled
                                    placeholder="usuario@dominio.com" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="flex flex-col gap-y-6">

                    <SectionTitle
                        title="INFORMACIÓN DE SEGURIDAD"
                        description="Consulta la información de seguridad de tu cuenta en la organización." />

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="control-container">
                            <label className="label">
                                Nombre de usuario:
                            </label>
                            <div className="relative">
                                <User className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={employeeResponse?.username}
                                    disabled
                                    placeholder="usuario" />
                            </div>
                        </div>
                        <div className="control-container">
                            <label className="label">
                                Rol de seguridad:
                            </label>
                            <div className="relative">
                                <Key className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={employeeResponse?.securityRole?.name}
                                    disabled
                                    placeholder="Rol de seguridad asignado" />
                            </div>
                        </div>
                        <div className="control-container">
                            <label className="label">
                                Puesto de trabajo:
                            </label>
                            <div className="relative">
                                <Briefcase className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={employeeResponse?.jobTitle?.name}
                                    disabled
                                    placeholder="Puesto de trabajo asignado" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Actions Buttons */}
                <section className="flex items-center justify-end mt-8 gap-x-4 border-t border-border pt-8">
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
