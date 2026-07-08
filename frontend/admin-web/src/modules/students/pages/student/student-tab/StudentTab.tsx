import { Link, useNavigate, useOutletContext } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { Mail, Phone } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { MEXICAN_STATES } from "@/lib/constants/mexican-states";
import { CustomSpinner } from "@/shared/components/CustomSpinner";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { DatePicker } from "@/shared/components/date-picker/DatePicker";
import { isValidEmail, isValidPhone } from "@/lib/extensions/validators";
import type { StudentRequest } from "@/interfaces/requests/student.request";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { StudentLayoutContext } from "@/modules/students/interfaces/student-layout-context";
import { useCreateUpdateStudent } from "@/modules/students/hooks/students/useCreateUpdateStudent";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { BLOOD_TYPES } from "@/lib/key-value-pairs/key-value-pair-catalogs";

export const StudentTab = () => {
    // Get context from layout
    const { student, studentId, isNew } = useOutletContext<StudentLayoutContext>();

    // Hooks & stores
    const navigate = useNavigate();
    const { showLoading, hideLoading } = useLoaderStore();
    const createUpdateStudentMutation = useCreateUpdateStudent();

    // Use hook form configuration
    const { control, handleSubmit, formState: { errors } } = useForm<Partial<StudentRequest>>({
        defaultValues: {
            name: isValidValueWithDefault(student?.name, ""),
            firstLastName: isValidValueWithDefault(student?.firstLastName, ""),
            secondLastName: isValidValueWithDefault(student?.secondLastName, ""),
            curp: isValidValueWithDefault(student?.curp, ""),
            dateOfBirth: isValidValueWithDefault(student?.dateOfBirth, ""),
            isActive: isValidValueWithDefault(student?.isActive, false),
            bloodType: isValidValueWithDefault(student?.bloodType, undefined),
            medicalNotes: isValidValueWithDefault(student?.medicalNotes, ""),
            observations: isValidValueWithDefault(student?.observations, ""),
            email: isValidValueWithDefault(student?.email, ""),
            phoneNumber: isValidValueWithDefault(student?.phoneNumber, ""),
            state: isValidValueWithDefault(student?.state, ""),
            municipality: isValidValueWithDefault(student?.municipality, ""),
            address: isValidValueWithDefault(student?.address, ""),
            postalCode: isValidValueWithDefault(student?.postalCode, ""),
        }
    });

    const onSubmit = async (studentRequestLike: Partial<StudentRequest>) => {
        try {
            showLoading("Guardando registro");
            await createUpdateStudentMutation.mutateAsync({ id: studentId, studentRequestLike }, {
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

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)}>

                <section className="flex flex-col gap-y-6">

                    <SectionTitle
                        title="INFORMACIÓN GENERAL DEL ESTUDIANTE"
                        description="En esta sección de la pantalla podrás configurar la información general de un estudiante, además de datos de domicilio y de contacto para darle un mejor seguimiento a la información del alumno dentro de la institución." />

                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

                        <div className="control-container">
                            <label className="label">Nombre del estudiante <span className="required">*</span>:</label>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        placeholder="Nombre del estudiante..."
                                    />
                                )} />
                            {
                                errors.name && (
                                    <p className="error">
                                        El nombre del estudiante es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Apellido paterno <span className="required">*</span>:</label>
                            <Controller
                                name="firstLastName"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        placeholder="Apellido paterno..."
                                    />
                                )} />
                            {
                                errors.firstLastName && (
                                    <p className="error">
                                        El apellido paterno del estudiante es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Apellido materno <span className="required">*</span>:</label>
                            <Controller
                                name="secondLastName"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        placeholder="Apellido materno..."
                                    />
                                )} />
                            {
                                errors.secondLastName && (
                                    <p className="error">
                                        El apellido materno del estudiante es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">CURP del estudiante <span className="required">*</span>:</label>
                            <Controller
                                name="curp"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        placeholder="Ejemplo: SASO750909HDFNNS05"
                                    />
                                )} />
                            {
                                errors.curp && (
                                    <p className="error">
                                        La CURP es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Fecha de nacimiento <span className="required">*</span>:</label>
                            <Controller
                                name="dateOfBirth"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <DatePicker
                                        {...field}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                )}
                            />
                            {
                                errors.dateOfBirth && (
                                    <p className="error">
                                        La fecha de nacimiento es obligatoria
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Matrícula del estudiante:</label>
                            <Input
                                disabled
                                value={student.enrollment}
                                type="text"
                                placeholder="Matrícula..."
                            />
                        </div>

                        <div className="control-container col-span-1 md:col-span-2 xl:col-span-3">
                            <label className="label">¿Registro activo?:</label>
                            <div className="flex items-center justify-center">
                                <Controller
                                    name="isActive"
                                    control={control}
                                    render={({ field }) => (
                                        <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-transparent dark:bg-muted/40 border border-border cursor-pointer transition-colors">
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{field.value ? "Activo" : "Inactivo"}</p>
                                                <p className="text-xs text-muted-foreground mt-1">El estudiante se encuentra activo o inactivo.</p>
                                            </div>
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        </label>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="control-container col-span-1 md:col-span-2 xl:col-span-3">
                            <label className="label">Observaciones adicionales:</label>
                            <Controller
                                name="observations"
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

                    <SectionTitle
                        title="INFORMACIÓN MÉDICA GENERAL DEL ESTUDIANTE"
                        description="En esta sección de la pantalla podrás configurar la información médica de un estudiante, asegúrate de que toda la información sea la correcta, será de ayuda para casos de emergencia." />

                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        
                        <div className="control-container">
                            <label className="label">
                                Tipo de sangre <span className="required">*</span>:
                            </label>
                            <Controller
                                control={control}
                                name={"bloodType"}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una opción">
                                                {labelOf(BLOOD_TYPES, field.value) || "Selecciona una opción"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Tipo de sagre</SelectLabel>
                                                {BLOOD_TYPES.map((item) => (
                                                    <SelectItem key={item.key} value={item.key} label={item.label}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {
                                errors.bloodType && (
                                    <p className="error">
                                        El tipo de sangre del estudiante es obligatorio
                                    </p>
                                )
                            }
                        </div>
                        
                        <div className="control-container col-span-1 md:col-span-2 xl:col-span-3">
                            <label className="label">Información médica complementaria:</label>
                            <Controller
                                name="medicalNotes"
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

                    <SectionTitle
                        title="DATOS DE CONTACTO DEL ESTUDIANTE"
                        description="Información necesaria para que el alumno pueda acceder a su portal de alumno, así como para que el personal administrativo pueda contactarlo en caso de ser necesario. Si el alumno es menor de edad, se recomienda utilizar el correo electrónico y número de teléfono de alguno de sus tutores para evitar problemas de comunicación." />

                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

                        <div className="control-container">
                            <label className="label">Correo electrónico <span className="required">*</span>:</label>
                            <Controller
                                name="email"
                                control={control}
                                rules={{ required: true, validate: (value) => isValidEmail(value) || "El correo electrónico no es válido" }}
                                render={({ field }) => (
                                    <div className="relative">
                                        <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            {...field}
                                            type="email"
                                            placeholder="usuario@dominio.com" />
                                    </div>
                                )}
                            />
                            {
                                errors.email && (
                                    <p className="error">
                                        {errors.email.message || "El correo electrónico del empleado es obligatorio"}
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Número de teléfono <span className="required">*</span>:</label>
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

                    </section>

                    <SectionTitle
                        title="DOMICILIO DEL ESTUDIANTE"
                        description="Información necesaria para poder atender cualquier incidente con el alumno." />

                    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

                        <div className="control-container">
                            <label className="label">
                                Estado dónde recide <span className="required">*</span>:
                            </label>
                            <Controller
                                control={control}
                                name={"state"}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una opción">
                                                {labelOf(MEXICAN_STATES, field.value) || "Selecciona una opción"}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Estado</SelectLabel>
                                                {MEXICAN_STATES.map((item) => (
                                                    <SelectItem key={item.key} value={item.key} label={item.label}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {
                                errors.state && (
                                    <p className="error">
                                        El estado es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Municipio o ciudad <span className="required">*</span>:</label>
                            <Controller
                                name="municipality"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        placeholder="Ejemplo: CDMX"
                                    />
                                )} />
                            {
                                errors.municipality && (
                                    <p className="error">
                                        El municipio de recidencia es obligatorio
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">Calle y número <span className="required">*</span>:</label>
                            <Controller
                                name="address"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        placeholder="Ejemplo: Lomas de la ribera No.#123"
                                    />
                                )} />
                            {
                                errors.address && (
                                    <p className="error">
                                        La calle y número de recidencia son obligatorios
                                    </p>
                                )
                            }
                        </div>

                        <div className="control-container">
                            <label className="label">
                                Código postal <span className="required">*</span>:
                            </label>
                            <Controller
                                name="postalCode"
                                control={control}
                                rules={{
                                    required: "El código postal es obligatorio",
                                    pattern: {
                                        value: /^\d+$/,
                                        message: "Solo se permiten números"
                                    },
                                    minLength: {
                                        value: 5,
                                        message: "El código postal debe contener 5 dígitos"
                                    },
                                    maxLength: {
                                        value: 5,
                                        message: "El código postal no puede contener más de 5 dígitos"
                                    }
                                }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={5}
                                        placeholder="Ejemplo: 37219"
                                        onKeyDown={(e) => {
                                            if (!/[0-9]|Backspace|Delete|Tab|ArrowLeft|ArrowRight|Home|End/.test(e.key)) {
                                                e.preventDefault();
                                            }
                                        }}
                                        onChange={(e) => {
                                            // Permite únicamente números y limita a 5 caracteres
                                            const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                                            field.onChange(value);
                                        }}
                                    />
                                )}
                            />

                            {errors.postalCode && (
                                <p className="error">{errors.postalCode.message}</p>
                            )}
                        </div>

                    </section>


                </section>


                {/* Actions Buttons */}
                <section className="flex items-center justify-end mt-8 gap-x-4 border-t border-border pt-8">
                    <Link to="/students">
                        <Button type="button" disabled={createUpdateStudentMutation.isPending} aria-label="cancel" variant={"ghost"}>
                            Cancelar
                        </Button>
                    </Link>
                    <Button type="submit" disabled={createUpdateStudentMutation.isPending} aria-label="save-record">
                        Guardar
                        {
                            createUpdateStudentMutation.isPending && (<CustomSpinner variant="primary" className="ml-4" />)
                        }
                    </Button>
                </section>

            </form >
        </>
    )
}
