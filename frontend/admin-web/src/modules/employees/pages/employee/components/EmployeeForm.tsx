import type { Employee } from '@/interfaces/entites/employee';
import { isValidPhone } from '@/lib/utils';

import { useJobTitlesForEmployees } from '@/modules/employees/hooks/useJobTitlesForEmployees';
import { useRolesForEmployees } from '@/modules/employees/hooks/useRolesForEmployees';
import { GET_JOB_TITLES_FOR_EMPLOYEE_QUERY_KEY, GET_ROLES_FOR_EMPLOYEE_QUERY_KEY } from '@/modules/employees/lib/queries-key';
import { CustomSearchInput } from '@/shared/components/CustomSearchInput';
import { CustomSpinner } from '@/shared/components/CustomSpinner';
import { useSearchInput } from '@/shared/hooks/useSearchInput';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Switch } from '@/shared/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { Mail, Phone, Save, User, X } from 'lucide-react';
import { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';

interface Props {
    employee?: Employee,
    isSubmitting: boolean,
    onSubmit: (employeeLike: Partial<Employee>) => void
}

export const EmployeeForm = ({ employee, isSubmitting, onSubmit }: Props) => {

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        setValue,
        watch,
        reset
    } = useForm<Partial<Employee>>({
        defaultValues: employee
    });
    const isNew = getValues('id') === "new";
    const selectedRoleId = watch('roleId');
    const selectedJobTitleId = watch('jobTitleId');

    // Role assign configuration
    const { query: rolesQuery, handleOnSearch: handleOnSearchRoles, handleOnOptionChange: handleOnOptionChangeRole, handleOnClearSelection: handleOnClearSelectionRole } = useSearchInput(
        {
            queryKey: GET_ROLES_FOR_EMPLOYEE_QUERY_KEY,
            setValue: setValue,
            fieldIdKey: 'roleId',
            fieldNameKey: 'role.name',
            propIdKey: 'id',
            propNameKey: 'name'
        }
    );
    const { data: roles, isFetching: isFetchingRoles } = useRolesForEmployees(rolesQuery);

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

    useEffect(() => {
        if (employee)
            reset(employee);
    }, [employee])

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-6">

                <div className="flex flex-col items-start gap-y-4 md:items-center md:flex-row md:justify-between border-b border-border pb-4">
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

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
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
                            Apellido materno:
                        </label>
                        <Input
                            type="text"
                            {...register('firstLastName')}
                            placeholder="Apellido materno"
                            className="pill-input w-full pl-8" />
                    </div>
                    <div className="w-full">
                        <label className="text-sm font-medium text-foreground mb-3 block">
                            Apellido paterno:
                        </label>
                        <Input
                            type="text"
                            {...register('firstLastName')}
                            placeholder="Apellido paterno"
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
                                    { errors.phoneNumber.message || 'El número de teléfono del empleado es obligatorio' }
                                </p>
                            )
                        }
                    </div>

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
                </div>

                <div className="flex flex-col items-start gap-y-4 border-b border-border pb-4 mt-7">
                    <h2 className="w-full text-muted-foreground">
                        INFORMACIÓN DEL EMPLEADO EN LA ORGANIZACIÓN
                    </h2>
                </div>

                <div className="grid grid-cols-3 gap-8">

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
                            {...register('roleId', { required: true })}
                            defaultValue={watch('role.name')}
                            selected={!!selectedRoleId}
                            placeholder="Busqueda de rol por asignar"
                            options={roles?.data ?? []}
                            isSearching={isFetchingRoles}
                            onClearSelection={handleOnClearSelectionRole}
                            onOptionChange={handleOnOptionChangeRole}
                            onSearch={handleOnSearchRoles}
                        />
                        {
                            (errors.roleId && !selectedRoleId) && (
                                <p className="text-red-500 text-sm mt-2">
                                    El rol es obligatorio
                                </p>
                            )
                        }
                    </div>

                </div>

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
