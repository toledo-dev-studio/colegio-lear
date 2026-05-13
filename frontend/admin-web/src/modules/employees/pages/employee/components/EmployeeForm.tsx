import { useEffect, useState } from 'react'
import { Link } from 'react-router';
import { Controller, useForm } from 'react-hook-form';
import { Mail, Phone, Save, User, X } from 'lucide-react';

import { Input } from '@/shared/ui/input';
import { isValidPhone } from '@/lib/utils';
import { Switch } from '@/shared/ui/switch';
import { Button } from '@/shared/ui/button';
import type { Employee } from '@/interfaces/entites/employee';
import { useSearchInput } from '@/shared/hooks/useSearchInput';
import { CustomSpinner } from '@/shared/components/CustomSpinner';
import { type SecurityRole } from '@/interfaces/entites/security-role';
import { CustomSearchInput } from '@/shared/components/CustomSearchInput';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { useSecurityRole } from '@/modules/security-roles/hooks/useSecurityRole';
import { useJobTitlesForEmployees } from '@/modules/employees/hooks/useJobTitlesForEmployees';
import { useSecurityRolesForEmployees } from '@/modules/employees/hooks/useSecurityRolesForEmployees';
import { SecurityRolePermissionsGrid } from '@/modules/security-roles/components/SecurityRolePermissionsGrid';
import { GET_JOB_TITLES_FOR_EMPLOYEE_QUERY_KEY, GET_SECURITY_ROLES_FOR_EMPLOYEE_QUERY_KEY } from '@/modules/employees/lib/queries-key';
import { CustomFullScreenLoading } from '@/shared/components/CustomFullScreenLoading';
import { CustomPhotoUploader } from '@/shared/components/CustomPhotoUploader';
import type { EmployeeFormData } from '@/modules/employees/interfaces/employee-form';

interface Props {
    employee?: Employee,
    isSubmitting: boolean,
    onSubmit: (employeeLike: Partial<EmployeeFormData>) => Promise<void>
}

const maxSize = 5 * 1024 * 1024;
const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];

export const EmployeeForm = ({ employee, isSubmitting, onSubmit }: Props) => {

    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        setValue,
        watch,
        reset
    } = useForm<Partial<EmployeeFormData>>({
        defaultValues: employee,
        mode: 'onChange'
    });
    const isNew = getValues('id') === "new";
    const selectedSecurityRoleId = watch('securityRoleId');
    const selectedJobTitleId = watch('jobTitleId');
    const { isFetching: isFetchingSecurityRoleDetails, refetch: refetchSecurityRoleDetails } = useSecurityRole(selectedSecurityRoleId, false);
    const [securityRoleDetails, setSecurityRoleDetails] = useState<SecurityRole | undefined>(undefined);

    // Role assign configuration
    const { query: securityRolesQuery, handleOnSearch: handleOnSearchSecurityRoles, handleOnOptionChange: handleOnOptionChangeSecurityRole, handleOnClearSelection: handleOnClearSelectionSecurityRole } = useSearchInput(
        {
            queryKey: GET_SECURITY_ROLES_FOR_EMPLOYEE_QUERY_KEY,
            setValue: setValue,
            fieldIdKey: 'securityRoleId',
            fieldNameKey: 'securityRole.name',
            propIdKey: 'id',
            propNameKey: 'name'
        }
    );
    const { data: securityRoles, isFetching: isFetchingSecurityRoles } = useSecurityRolesForEmployees(securityRolesQuery);

    // JobTitle assign configuration
    const { query: jobTitlesQuery, handleOnSearch: handleOnSearchJobTitles, handleOnOptionChange: handleOnOptionChangeJobTitle, handleOnClearSelection: handleOnClearSelectionJobTitle } = useSearchInput(
        {
            queryKey: GET_JOB_TITLES_FOR_EMPLOYEE_QUERY_KEY,
            setValue: setValue,
            fieldIdKey: 'jobTitleId',
            fieldNameKey: 'jobTitle.name',
            propIdKey: 'id',
            propNameKey: 'name'
        }
    );
    const { data: jobTitles, isFetching: isFetchingJobTitles } = useJobTitlesForEmployees(jobTitlesQuery);

    const getSecurityRoleDetails = async () => {
        const { data } = await refetchSecurityRoleDetails();
        setSecurityRoleDetails(data);
    }

    useEffect(() => {
        if (employee)
            reset(employee);
    }, [employee]);

    useEffect(() => {
        if (!selectedSecurityRoleId) {
            setSecurityRoleDetails(undefined);
            return;
        }
        getSecurityRoleDetails();
    }, [selectedSecurityRoleId])

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6">

                <div className="flex flex-col items-start justify-center gap-y-4 md:items-center md:flex-row md:justify-between border-b border-border pb-4">
                    <h2 className="w-full text-muted-foreground">
                        INFORMACIÓN GENERAL DEL EMPLEADO
                    </h2>
                    <div className="w-fit flex items-center">
                        <Tooltip>
                            <TooltipTrigger>
                                <Switch
                                    size="default"
                                    checked={watch('status') ?? false}
                                    onCheckedChange={(checked) => setValue('status', checked)} />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Estatus del registro</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-2">
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

                    <div className="w-full grid grid-cols-1 md:col-span-2 md:grid-cols-2 gap-8">
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Nombre <span className="text-destructive">*</span>:
                            </label>
                            <Input
                                type="text"
                                {...register('name', { required: true })}
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
                                {...register('firstLastName', { required: true })}
                                placeholder="Apellido paterno"
                                className="pill-input w-full pl-8" />
                        </div>
                        <div className="w-full">
                            <label className="text-sm font-medium text-foreground mb-3 block">
                                Apellido materno:
                            </label>
                            <Input
                                type="text"
                                {...register('secondLastName')}
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
                                    {...register('phoneNumber', { required: true, validate: (value) => isValidPhone(value) })}
                                    placeholder="+52 (55) 1234-5678"
                                    maxLength={10}
                                    className="pill-input w-full pl-8 pr-13" />
                            </div>
                            {
                                errors.phoneNumber && (
                                    <p className="text-red-500 text-sm mt-2">
                                        {errors.phoneNumber.message || 'El número de teléfono del empleado es obligatorio'}
                                    </p>
                                )
                            }
                        </div>

                    </div>
                </div>

                <div className="flex flex-col items-start gap-y-4 border-b border-border pb-4 mt-7">
                    <h2 className="w-full text-muted-foreground">
                        INFORMACIÓN DEL EMPLEADO EN LA ORGANIZACIÓN
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-2">

                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-3 block">
                            Correo electrónico <span className="text-destructive">*</span>:
                        </label>
                        <div className="relative">
                            <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="email"
                                {...register('email', { required: true })}
                                placeholder="usuario@dominio.com"
                                className="pill-input w-full pl-8 pr-13" />
                        </div>
                        {
                            errors.email && (
                                <p className="text-red-500 text-sm mt-2">
                                    El correo electrónico del empleado es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-3 block">
                            Nombre de usuario:
                            {isNew && <span className="text-destructive">*</span>}
                        </label>
                        <div className="relative">
                            <User className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                {...register('username', { required: isNew })}
                                disabled={!isNew}
                                placeholder="Nombre de usuario"
                                className="pill-input w-full pl-8 pr-13" />
                        </div>
                        {
                            errors.username && (
                                <p className="text-red-500 text-sm mt-2">
                                    El usuario del sistema del empleado es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-2 block">
                            Puesto de trabajo <span className="text-destructive">*</span>:
                        </label>
                        <CustomSearchInput
                            {...register('jobTitleId', { required: true })}
                            defaultValue={watch('jobTitle.name')}
                            selected={!!selectedJobTitleId}
                            placeholder="Busqueda de puesto de trabajo"
                            options={jobTitles?.data ?? []}
                            isSearching={isFetchingJobTitles}
                            onClearSelection={handleOnClearSelectionJobTitle}
                            onOptionChange={handleOnOptionChangeJobTitle}
                            onSearch={handleOnSearchJobTitles}
                        />
                        {
                            (errors.jobTitleId && !selectedJobTitleId) && (
                                <p className="text-red-500 text-sm mt-2">
                                    El puesto de trabajo es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-2 block">
                            Rol por asignar <span className="text-destructive">*</span>:
                        </label>
                        <CustomSearchInput
                            {...register('securityRoleId', { required: true })}
                            defaultValue={watch('securityRole.name')}
                            selected={!!selectedSecurityRoleId}
                            placeholder="Busqueda de rol por asignar"
                            options={securityRoles?.data ?? []}
                            isSearching={isFetchingSecurityRoles}
                            onClearSelection={handleOnClearSelectionSecurityRole}
                            onOptionChange={handleOnOptionChangeSecurityRole}
                            onSearch={handleOnSearchSecurityRoles}
                        />
                        {
                            (errors.securityRoleId && !selectedSecurityRoleId) && (
                                <p className="text-red-500 text-sm mt-2">
                                    El rol de seguridad es obligatorio
                                </p>
                            )
                        }
                    </div>
                </div>

                {/* Security Role Permissions Grid */}
                {
                    <div className="w-full flex flex-col">
                        <div className="flex flex-col items-start gap-y-4 border-b border-border pb-4 mt-7">
                            <h2 className="w-full text-muted-foreground">
                                PRIVILEGIOS DE ROL DE SEGURIDAD SELECCIONADO
                            </h2>
                        </div>
                        {
                            !selectedSecurityRoleId && (<p className="text-center text-muted-foreground mt-8">Seleccione un rol de seguridad para visualizar sus privilegios</p>)
                        }
                        <div className="w-full relative my-10">
                            {
                                isFetchingSecurityRoleDetails && (<CustomFullScreenLoading title="Cargando privilegios" subtitle="Cargando privilegios del rol de seguridad seleccionado" className="relative" />)
                            }
                            {
                                securityRoleDetails && (<SecurityRolePermissionsGrid disabled={true} permissions={securityRoleDetails.permissions ?? []}></SecurityRolePermissionsGrid>)
                            }
                        </div>
                    </div>
                }

                {/* Actions Buttons */}
                <div className="flex items-center justify-end mt-8 gap-x-6">
                    <Link to="/employees">
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
                </div>

            </form>
        </>
    )
}
