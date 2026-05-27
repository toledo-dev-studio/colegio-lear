import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { Mail, Phone, Save, X } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import type { Student } from "@/interfaces/entites/student";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { CustomSpinner } from "@/shared/components/CustomSpinner";
import { CustomDatePicker } from "@/shared/components/CustomDatePicker";
import { isValidEmail, isValidPhone } from "@/lib/extensions/validators";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { useCreateUpdateStudentGeneralInformation } from "@/modules/students/hooks/students/useCreateUpdateStudentGeneralInformation";

interface Props {
    student?: Student,
    isNew: boolean,
}

export const StudentGeneralInformationForm = ({ student, isNew }: Props) => {

    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoaderStore();
    const mutation = useCreateUpdateStudentGeneralInformation();

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset
    } = useForm<Partial<Student>>({
        defaultValues: {
            ...student,
        }
    });

    const isSubmitting = false;

    const onSubmit = async (studentLike: Partial<Student>) => {
        try {
            showLoading("Guardando registro");
            await mutation.mutateAsync(studentLike, {
                onSuccess: (response) => {
                    toast.success(isNew ? "Estudiante creado correctamente" : "Estudiante actualizado correctamente", { position: "top-right" });
                    hideLoading();
                    navigate(`/students/${response.id}`);
                }
            });
        } catch (error) {
            console.warn(error);
            hideLoading();
            toast.error(isNew ? "Ocurrió un error al tratar de crear el estudiante" : "Ocurrió un error al tratar de actualizar el estudiante", { position: "top-right" });
        }
    }

    useEffect(() => {
        if (student)
            reset(student);
    }, [student]);

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>

                {/* Main student information */}
                <section className="flex flex-col gap-y-6 mt-1">
                    <div className="flex flex-col gap-y-2 justify-center border-b border-border pb-4">
                        <div className="flex flex-col items-start gap-y-4 md:items-center md:flex-row md:justify-between">
                            <h2 className="w-full text-muted-foreground">
                                INFORMACIÓN GENERAL DEL ESTUDIANTE
                            </h2>
                            <div className="w-fit flex items-center">
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Switch
                                            size="default"
                                            checked={watch("status") ?? false}
                                            onCheckedChange={(checked) => setValue("status", checked)} />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Estatus del registro</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            En esta sección de la pantalla podrás configurar la información general de un estudiante, además de datos de domicilio y de contacto para darle un mejor seguimiento a la información del alumno dentro de la institución.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Nombre del estudiante <span className="text-destructive">*</span>:
                            </label>
                            <Input
                                type="text"
                                {...register("name", { required: true })}
                                placeholder="Nombre del estudiante..." />
                            {
                                errors.name && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El nombre del estudiante es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Apellido paterno <span className="text-destructive">*</span>:
                            </label>
                            <Input
                                type="text"
                                {...register("firstLastName", { required: true })}
                                placeholder="Apellido paterno..." />
                            {
                                errors.firstLastName && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El apellido paterno es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Apellido materno <span className="text-destructive">*</span>:
                            </label>
                            <Input
                                type="text"
                                {...register("secondLastName", { required: true })}
                                placeholder="Apellido materno..." />
                            {
                                errors.secondLastName && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El apellido materno es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">Fecha de publicación <span className="text-destructive">*</span>:</label>
                            <Controller
                                name="dateOfBirth"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <CustomDatePicker
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {
                                errors.dateOfBirth && (
                                    <p className="text-red-500 text-sm mt-2">
                                        La fecha de nacimiento del estudiante es obligatoria
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                CURP <span className="text-destructive">*</span>:
                            </label>
                            <Input
                                type="text"
                                {...register("curp", { required: true })}
                                placeholder="Ejemplo: SASO750909HDFNNS05" />
                            {
                                errors.curp && (
                                    <p className="text-red-500 text-sm mt-2">
                                        La CURP es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        {
                            !isNew && (
                                <div className="w-full">
                                    <label className="text-sm font-medium text-foreground mb-3 block">
                                        Matrícula:
                                    </label>
                                    <Input
                                        type="text"
                                        disabled
                                        value={student?.enrollment}
                                        placeholder="Ejemplo: 123456789" />
                                </div>
                            )
                        }

                        <div className="w-full col-span-1 md:col-span-2 xl:col-span-3">
                            <label className="text-sm font-medium text-foreground mb-3 block">Observaciones adicionales:</label>
                            <Textarea
                                {...register("observations")}
                                placeholder="Observaciones..." />
                        </div>
                    </div>
                </section>

                {/* Contact student information */}
                <section className="flex flex-col gap-y-6 mt-8">
                    <div className="flex flex-col gap-y-4 justify-center border-b border-border pb-4">
                        <h2 className="w-full text-muted-foreground">
                            DATOS DE CONTACTO DEL ESTUDIANTE
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Información que servirá para que el alumno pueda acceder a su portal de alumno, así como para que el personal administrativo pueda contactarlo en caso de ser necesario.
                            Si el alumno es menor de edad, se recomienda utilizar el correo electrónico y número de teléfono de alguno de sus tutores para evitar problemas de comunicación.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Correo electrónico <span className="text-destructive">*</span>:
                            </label>
                            <div className="relative">
                                <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="email"
                                    {...register("email",
                                        {
                                            required: true,
                                            validate: {
                                                isValidEmail: (value) => isValidEmail(value) || "El correo electrónico no es válido"
                                            }
                                        }
                                    )}
                                    placeholder="usuario@dominio.com"
                                    className="pr-13" />
                            </div>
                            {
                                errors.email && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {errors.email.message || "El correo electrónico del empleado es obligatorio"}
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Número de teléfono<span className="text-destructive">*</span>:
                            </label>
                            <div className="relative">
                                <Phone className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="number"
                                    {...register("phoneNumber",
                                        {
                                            required: true,
                                            validate: {
                                                isValidPhone: (value) => isValidPhone(value) || "El número de teléfono no es válido"
                                            }
                                        }
                                    )}
                                    placeholder="+52 (55) 1234-5678"
                                    maxLength={10}
                                    className="pr-13" />
                            </div>
                            {
                                errors.phoneNumber && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {errors.phoneNumber.message || "El número de teléfono del empleado es obligatorio"}
                                    </p>
                                )
                            }
                        </div>
                    </div>

                </section>

                {/* Address student information */}
                <section className="flex flex-col gap-y-6 mt-8">
                    <div className="flex flex-col gap-y-4 items-center border-b border-border pb-4">
                        <h2 className="w-full text-muted-foreground">
                            DOMICILIO DEL ESTUDIANTE
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Calle y número <span className="text-destructive">*</span>:
                            </label>
                            <Input
                                type="text"
                                {...register("address", { required: true })}
                                placeholder="Ejemplo: Lomas de la rivera No. #123" />
                            {
                                errors.address && (
                                    <p className="text-red-500 text-sm mt-2">
                                        La dirección es obligatoria
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Estado <span className="text-destructive">*</span>:
                            </label>
                            <Input
                                type="text"
                                {...register("state", { required: true })}
                                placeholder="Ejemplo: Estado de México" />
                            {
                                errors.state && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El estado es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Municipio o ciudad<span className="text-destructive">*</span>:
                            </label>
                            <Input
                                type="text"
                                {...register("municipality", { required: true })}
                                placeholder="Ejemplo: CDMX" />
                            {
                                errors.municipality && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El municipio es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Código postal <span className="text-destructive">*</span>:
                            </label>
                            <Input
                                type="number"
                                className="pr-13"
                                step={1}
                                min={0}
                                inputMode="numeric"
                                placeholder="Ejemplo: 54321"
                                onKeyDown={(e) => { if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault(); }}
                                {...register("postalCode", {
                                    valueAsNumber: true,
                                    validate: {
                                        integer: (v) => Number.isInteger(v) || "No se permiten decimales",
                                        nonNegative: (v) => +v! >= 0 || "El código postal no puede ser negativo",
                                    },
                                })} />
                            {
                                errors.postalCode && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El código postal es obligatorio
                                    </p>
                                )
                            }
                        </div>
                    </div>
                </section>

                {/* Actions Buttons */}
                <section className="flex items-center justify-end mt-10 gap-x-6">
                    <Link to="/students">
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
                </section>

            </form>
        </>
    )
}
