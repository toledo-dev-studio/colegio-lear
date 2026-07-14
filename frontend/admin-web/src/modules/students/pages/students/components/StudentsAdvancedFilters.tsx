import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { Mail, Phone } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import { isValidEmail, isValidPhone } from "@/lib/extensions/validators";
import type { StudentFilter } from "@/interfaces/filters/student.filter";
import { isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const StudentsAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {
    // Component hooks & stores
    const [searchParams, setSearchParams] = useSearchParams();
    const studentsLikeFilter: Partial<StudentFilter> = {
        fullName: isValidValueWithDefault(searchParams.get("full-name"), ""),
        curp: isValidValueWithDefault(searchParams.get("curp"), ""),
        enrollment: isValidValueWithDefault(searchParams.get("enrollment"), ""),
        email: isValidValueWithDefault(searchParams.get("email"), ""),
        phoneNumber: isValidValueWithDefault(searchParams.get("phone-number"), ""),
        isActive: stringToBooleanWithDefault(searchParams.get("is-active"))
    };

    const { control, formState: { errors }, handleSubmit, reset } = useForm<Partial<StudentFilter>>({
        defaultValues: studentsLikeFilter
    });

    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete("query");
        searchParams.delete("full-name");
        searchParams.delete("enrollment");
        searchParams.delete("curp");
        searchParams.delete("email");
        searchParams.delete("phone-number");
        searchParams.delete("is-active");
        reset({});
        setSearchParams(searchParams);
        handleClickClose();
    }

    const onSubmit = (filter: Partial<StudentFilter>) => {
        searchParams.set("is-active", `${filter.isActive}`);
        filter.fullName ? searchParams.set("full-name", filter.fullName) : searchParams.delete("full-name");
        filter.enrollment ? searchParams.set("enrollment", filter.enrollment) : searchParams.delete("enrollment");
        filter.curp ? searchParams.set("curp", filter.curp) : searchParams.delete("curp");
        filter.email ? searchParams.set("email", filter.email) : searchParams.delete("email");
        filter.phoneNumber ? searchParams.set("phone-number", filter.phoneNumber) : searchParams.delete("phone-number");
        setSearchParams(searchParams);
        handleClickClose();
    }

    return (
        <>
            <SidePanel
                title={title}
                handleClickClose={handleClickClose}
                cancelButton={{ show: true, disabled: false, type: "button", label: "Limpiar filtros", handleClick: handleClickClearFilters }}
                submitButton={{ show: true, disabled: false, type: "submit", label: "Aplicar filtros", handleClick: handleSubmit(onSubmit) }}>
                
                <form className="flex flex-col gap-8">

                    <div className="control-container">
                        <label className="label">Nombre completo:</label>
                        <Controller
                            name="fullName"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder="Nombre completo..."
                                />
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Matrícula del estudiante:</label>
                        <Controller
                            name="enrollment"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder="Matrícula..."
                                />
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">CURP del estudiante:</label>
                        <Controller
                            name="curp"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder="CURP del estudiante..."
                                />
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Número de teléfono:</label>
                        <Controller
                            name="phoneNumber"
                            control={control}
                            rules={{ validate: (value) => !value ? true : isValidPhone(value) || "El número de teléfono debe tener al menos 10 dígitos" }}
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
                        <label className="label">Correo electrónico:</label>
                        <Controller
                            name="email"
                            control={control}
                            rules={{ validate: (value) => !value ? true : isValidEmail(value) || "El correo electrónico no es válido" }}
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
                        <label className="label">¿Registro activo?:</label>
                        <div className="flex items-center justify-center">
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <label className="switch-control-container">
                                        <div>
                                            <p className="label">{field.value ? "Activo" : "Inactivo"}</p>
                                            <p className="description">El estudiante se encuentra activo o inactivo.</p>
                                        </div>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </label>
                                )}
                            />
                        </div>
                    </div>

                </form>
            </SidePanel>

        </>
    );
}
