import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "react-router";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { stringToBooleanWithDefault } from "@/lib/utils";
import type { Employee } from "@/interfaces/entites/employee";
import { useSearchInput } from "@/shared/hooks/useSearchInput";
import { CustomSearchInput } from "@/shared/components/CustomSearchInput";
import { useSecurityRolesForEmployees } from "@/modules/employees/hooks/useSecurityRolesForEmployees";
import { useJobTitlesForEmployees } from "@/modules/employees/hooks/useJobTitlesForEmployees";
import { GET_JOB_TITLES_FOR_EMPLOYEE_QUERY_KEY, GET_SECURITY_ROLES_FOR_EMPLOYEE_QUERY_KEY } from "@/modules/employees/lib/queries-key";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const EmployeesAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {

    // Main hooks
    const [searchParams, setSearchParams] = useSearchParams();

    // Form config
    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch
    } = useForm<Partial<Employee>>({
        defaultValues: {
            name: searchParams.get('query') ?? '',
            status: stringToBooleanWithDefault(searchParams.get('status')),
            securityRoleId: searchParams.get('security-role-id') ?? undefined,
            securityRole: {
                name: searchParams.get('security-role-name') ?? undefined,
            },
            jobTitleId: searchParams.get('job-title-id') ?? undefined,
            jobTitle: {
                name: searchParams.get('job-title-name') ?? undefined,
            }
        }
    });

    // Role assign configuration
    const { query: rolesQuery, handleOnSearch: handleOnSearchRoles, handleOnOptionChange: handleOnOptionChangeRole, handleOnClearSelection: handleOnClearSelectionRole } = useSearchInput(
        {
            queryKey: GET_SECURITY_ROLES_FOR_EMPLOYEE_QUERY_KEY,
            setValue: setValue,
            fieldIdKey: 'securityRoleId',
            fieldNameKey: 'securityRole.name',
            propIdKey: 'id',
            propNameKey: 'name'
        }
    );
    const { data: roles, isFetching: isFetchingRoles } = useSecurityRolesForEmployees(rolesQuery);

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

    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete('query');
        searchParams.delete('status');
        searchParams.delete('security-role-id');
        searchParams.delete('security-role-name');
        searchParams.delete('job-title-id');
        searchParams.delete('job-title-name');
        reset({
            name: '',
            status: true,
            securityRoleId: undefined,
            securityRole: {
                name: undefined
            }
        });
        setSearchParams(searchParams);
        handleOnClearSelectionRole();
        handleClickClose();
    }

    const handleSubmitForm = (filter: Partial<Employee>) => {
        searchParams.set('status', `${filter.status}`);
        filter.name ? searchParams.set('query', filter.name) : searchParams.delete('query');
        filter.securityRoleId ? searchParams.set('security-role-id', filter.securityRoleId) : searchParams.delete('security-role-id');
        filter.securityRole?.name ? searchParams.set('security-role-name', filter.securityRole.name) : searchParams.delete('security-role-name');
        filter.jobTitleId ? searchParams.set('job-title-id', filter.jobTitleId) : searchParams.delete('job-title-id');
        filter.jobTitle?.name ? searchParams.set('job-title-name', filter.jobTitle.name) : searchParams.delete('job-title-name');
        setSearchParams(searchParams);
        handleClickClose();
    }

    return (
        <>
            <form onSubmit={handleSubmit(handleSubmitForm)} className="fixed inset-0 z-50 flex justify-end" data-testid="filter-drawer">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClickClose} />
                <aside className="relative box-border bg-card w-full max-w-md h-full border-l border-border shadow-2xl flex flex-col animate-slide-in-right">
                    <div className="h-22 flex items-center justify-between px-10 border-b border-border">
                        <h3 className="font-heading text-xl font-bold uppercase">
                            {title}
                        </h3>
                        <Button onClick={handleClickClose} data-testid="filter-drawer-close" className="min-w-10 min-h-10 bg-white text-foreground !px-0">
                            <X className="!w-5 !h-5 text-muted-foreground" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-10 py-10 space-y-5">

                        {/* Contenido de filtrados */}
                        <div className="flex flex-col gap-8">
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Nombre completo:</label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        {...register('name')}
                                        placeholder="Nombre del empleado..."
                                        className="pill-input w-full pl-8"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Puesto de trabajo:</label>
                                <CustomSearchInput
                                    defaultValue={watch('jobTitle.name')}
                                    selected={!!watch('jobTitleId')}
                                    placeholder="Busqueda de puesto de trabajo"
                                    options={jobTitles?.data ?? []}
                                    isSearching={isFetchingJobTitles}
                                    onClearSelection={handleOnClearSelectionJobTitle}
                                    onOptionChange={handleOnOptionChangeJobTitle}
                                    onSearch={handleOnSearchJobTitles}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Rol asignado:</label>
                                <CustomSearchInput
                                    defaultValue={watch('securityRole.name')}
                                    selected={!!watch('securityRoleId')}
                                    placeholder="Busqueda de rol asignado"
                                    options={roles?.data ?? []}
                                    isSearching={isFetchingRoles}
                                    onClearSelection={handleOnClearSelectionRole}
                                    onOptionChange={handleOnOptionChangeRole}
                                    onSearch={handleOnSearchRoles}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Estatus:</label>
                                <Switch
                                    size="default"
                                    checked={watch('status')}
                                    onCheckedChange={(checked) => setValue('status', checked, { shouldTouch: true })} />
                            </div>
                        </div>
                    </div>
                    <div className="px-8 py-6 border-t border-border flex items-center justify-between gap-3 box-border">
                        <Button
                            type="button"
                            variant={"destructive"}
                            data-testid="filter-clear-button"
                            className="pill-btn-outline px-10"
                            onClick={handleClickClearFilters}>
                            Limpiar filtros
                        </Button>
                        <Button
                            type="submit"
                            data-testid="filter-apply-button"
                            className="pill-btn-primary px-10">
                            Aplicar filtros
                        </Button>
                    </div>
                </aside>
            </form>
        </>
    );
}
