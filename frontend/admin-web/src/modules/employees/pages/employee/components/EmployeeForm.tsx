import { useEffect } from "react"
import { Link } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { Mail, Phone, User } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { isValidEmail, isValidPhone } from "@/lib/extensions/validators";
import { Spinner } from "@/shared/components/spinner/Spinner";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { SearchInput } from "@/shared/components/search-input/SearchInput";
import type { EmployeeRequest } from "@/interfaces/requests/employee.request";
import { CustomPhotoUploader } from "@/shared/components/CustomPhotoUploader";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";
import type { JobTitleResponse } from "@/interfaces/responses/job-title.response";
import { useSearchJobTitles } from "@/modules/job-titles/hooks/useSearchJobTitles";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import type { SecurityRoleResponse } from "@/interfaces/responses/security-role.response";
import { useSearchSecurityRoles } from "@/modules/security-roles/hooks/useSearchSecurityRoles";
import { SecurityRolePermissionsGrid } from "@/modules/security-roles/components/SecurityRolePermissionsGrid";
import { useGetSecurityRoleByIdForEmployee } from "@/modules/employees/hooks/security-roles/useGetSecurityRoleByIdForEmployee";
import { Switch } from "@/shared/ui/switch";

interface Props {
    isSubmitting: boolean;
    employeeResponse?: EmployeeResponse;
    onSubmit: (employeeRequestLike: Partial<EmployeeRequest>) => Promise<void>;
}

const maxSize = 5 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];

export const EmployeeForm = ({ isSubmitting, employeeResponse, onSubmit }: Props) => {
    // Component hooks & stores
    const searchJobTitlesMutation = useSearchJobTitles();
    const searchSecurityRolesMutation = useSearchSecurityRoles();
    const getByIdSecurityRoleForEmployee = useGetSecurityRoleByIdForEmployee();

    // Use react hook form configuration
    const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<Partial<EmployeeRequest>>({
        defaultValues: {
            name: isValidValueWithDefault(employeeResponse?.name, ""),
            firstLastName: isValidValueWithDefault(employeeResponse?.firstLastName, ""),
            secondLastName: isValidValueWithDefault(employeeResponse?.secondLastName, ""),
            phoneNumber: isValidValueWithDefault(employeeResponse?.phoneNumber, ""),
            email: isValidValueWithDefault(employeeResponse?.email, ""),
            image: isValidValueWithDefault(employeeResponse?.image, ""),
            isActive: isValidValueWithDefault(employeeResponse?.isActive, false),
            securityRoleId: isValidValueWithDefault(employeeResponse?.securityRoleId, ""),
            securityRole: isValidValueWithDefault(employeeResponse?.securityRole, undefined),
            jobTitleId: isValidValueWithDefault(employeeResponse?.jobTitleId, ""),
            jobTitle: isValidValueWithDefault(employeeResponse?.jobTitle, undefined),
        },
    });
    const jobTitle = watch("jobTitle");
    const securityRole = watch("securityRole");

    useEffect(() => {
        const getSecurityRoleById = async () => {
            if (!securityRole) {
                getByIdSecurityRoleForEmployee.setSecurityRole(undefined);
                return;
            }
            await getByIdSecurityRoleForEmployee.searchAsync(securityRole.id!);
        }
        getSecurityRoleById();
    }, [securityRole])

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6">

                <SectionTitle
                    title="INFORMACIÓN GENERAL DEL EMPLEADO"
                    description="Registro de información básica del empleado con acceso al sistema y a la organización." />

                <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
                    <Controller
                        name="file"
                        control={control}
                        rules={{
                            validate: {
                                maxSize: (file) => !file ? true : file!.size <= maxSize || "El tamaño de la imagen debe ser menor o igual a 5MB",
                                validFormat: (file) => !file ? true : allowedTypes.includes(file!.type) || "El formato seleccionado no es un válido"
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

                    <section className="w-full grid grid-cols-1 md:col-span-2 md:grid-cols-2 gap-8">
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

                    </section>
                </section>

                <SectionTitle
                    title="INFORMACIÓN DEL EMPLEADO EN LA ORGANIZACIÓN"
                    description="Información del empleado referente a su labor dentro de la organización." />

                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">

                    <div className="control-container">
                        <label className="label">Correo electrónico del empleado <span className="required">*</span>:</label>
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
                                    El correo electrónico del empleado es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="control-container">
                        <label className="label">Nombre de usuario:</label>
                        <div className="relative">
                            <User className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                disabled
                                defaultValue={employeeResponse?.username}
                                placeholder="Nombre de usuario" />
                        </div>
                    </div>

                    <div className="control-container">
                        <label className="label">Puesto de trabajo <span className="required">*</span>:</label>
                        <Controller
                            name="jobTitleId"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <SearchInput
                                    {...field}
                                    defaultValue={jobTitle?.name}
                                    selected={!!jobTitle?.id}
                                    placeholder="Busqueda de puesto de trabajo"
                                    options={searchJobTitlesMutation.jobTitles}
                                    isSearching={searchJobTitlesMutation.isPending}
                                    onClearSelection={() => {
                                        setValue("jobTitle", undefined);
                                        setValue("jobTitleId", undefined);
                                        searchJobTitlesMutation.clearSearchResult();
                                    }}
                                    onOptionChange={async (option: JobTitleResponse) => {
                                        setValue("jobTitle", option);
                                        setValue("jobTitleId", option.id);
                                        searchJobTitlesMutation.clearSearchResult();
                                    }}
                                    onSearch={async (query) => searchJobTitlesMutation.searchAsync({ query, isActive: true })}
                                />
                            )}
                        />
                        {
                            (errors.jobTitleId && !jobTitle) && (
                                <p className="error">
                                    El puesto de trabajo es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="control-container">
                        <label className="label">Rol de seguridad <span className="required">*</span>:</label>
                        <Controller
                            name="securityRoleId"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <SearchInput
                                    {...field}
                                    defaultValue={securityRole?.name}
                                    selected={!!securityRole?.id}
                                    placeholder="Busqueda de rol de seguridad"
                                    options={searchSecurityRolesMutation.securityRoles}
                                    isSearching={searchSecurityRolesMutation.isPending}
                                    onClearSelection={() => {
                                        setValue("securityRole", undefined);
                                        setValue("securityRoleId", undefined);
                                        searchSecurityRolesMutation.clearSearchResult();
                                    }}
                                    onOptionChange={async (option: SecurityRoleResponse) => {
                                        setValue("securityRole", option);
                                        setValue("securityRoleId", option.id);
                                        searchSecurityRolesMutation.clearSearchResult();
                                    }}
                                    onSearch={async (query) => searchSecurityRolesMutation.searchAsync({ query, isActive: true })}
                                />
                            )}
                        />
                        {
                            (errors.securityRoleId && !securityRole) && (
                                <p className="error">
                                    El rol de seguridad es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="control-container md:col-span-2">
                        <label className="label">¿Registro activo?:</label>
                        <div className="flex items-center justify-center">
                            <Controller
                                name="isActive"
                                control={control}
                                render={({ field }) => (
                                    <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-transparent dark:bg-muted/40 border border-border cursor-pointer transition-colors">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{field.value ? "Activo" : "Inactivo"}</p>
                                            <p className="text-xs text-muted-foreground mt-1">El empleado se encuentra activo o inactivo.</p>
                                        </div>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </label>
                                )}
                            />
                        </div>
                    </div>
                </section>

                {/* Security Role Permissions Grid */}
                {
                    <div className="w-full flex flex-col">
                        <SectionTitle
                            title="PRIVILEGIOS DE ROL DE SEGURIDAD SELECCIONADO"
                            description="Previsualización de los permisos según el rol de seguridad seleccionado para el empleado." />

                        {
                            !securityRole && (<p className="text-center text-muted-foreground mt-8">Seleccione un rol de seguridad para visualizar sus privilegios</p>)
                        }
                        {
                            (getByIdSecurityRoleForEmployee.isError && securityRole) && (<p className="text-center text-muted-foreground mt-8">No fue posible obtener los detalles del rol de seguridad seleccionado</p>)
                        }
                        <div className="w-full relative my-10">
                            {
                                getByIdSecurityRoleForEmployee.isPending && (<CustomFullScreenLoading title="Cargando privilegios" subtitle="Cargando privilegios del rol de seguridad seleccionado" className="relative" />)
                            }
                            {
                                getByIdSecurityRoleForEmployee.securityRole && (<SecurityRolePermissionsGrid disabled={true} permissions={getByIdSecurityRoleForEmployee.securityRole.permissions ?? []}></SecurityRolePermissionsGrid>)
                            }
                        </div>
                    </div>
                }

                {/* Actions Buttons */}
                <section className="flex items-center justify-end mt-8 gap-x-4 border-t border-border pt-8">
                    <Link to="/employees">
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
