import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import type { EmployeeFilter } from "@/interfaces/filters/employee.filter";
import { SearchInput } from "@/shared/components/search-input/SearchInput";
import type { JobTitleResponse } from "@/interfaces/responses/job-title.response";
import { useSearchJobTitles } from "@/modules/job-titles/hooks/useSearchJobTitles";
import type { SecurityRoleResponse } from "@/interfaces/responses/security-role.response";
import { useSearchSecurityRoles } from "@/modules/security-roles/hooks/useSearchSecurityRoles";
import { isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const EmployeesAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {
    // Component hooks & stores
    const [searchParams, setSearchParams] = useSearchParams();
    const searchSecurityRolesMutation = useSearchSecurityRoles();
    const searchJobTitlesMutation = useSearchJobTitles();
    const employeeFilterLike: Partial<EmployeeFilter> = {
        fullName: isValidValueWithDefault(searchParams.get("full-name"), ""),
        isActive: stringToBooleanWithDefault(searchParams.get("is-active")),
        securityRoleId: isValidValueWithDefault(searchParams.get("security-role-id"), undefined),
        securityRole: {
            name: isValidValueWithDefault(searchParams.get("security-role-name"), ""),
        },
        jobTitleId: isValidValueWithDefault(searchParams.get("job-title-id"), ""),
        jobTitle: {
            name: isValidValueWithDefault(searchParams.get("job-title-name"), "")
        }
    };

    // Use react hook form configuration
    const { control, handleSubmit, setValue, reset, watch } = useForm<Partial<EmployeeFilter>>({
        defaultValues: employeeFilterLike
    });
    const jobTitle = watch("jobTitle");
    const jobTitleId = watch("jobTitleId");
    const securityRole = watch("securityRole");
    const securityRoleId = watch("securityRoleId");

    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete("query");
        searchParams.delete("full-name");
        searchParams.delete("status");
        searchParams.delete("security-role-id");
        searchParams.delete("security-role-name");
        searchParams.delete("job-title-id");
        searchParams.delete("job-title-name");
        reset({});
        setSearchParams(searchParams);
        handleClickClose();
    }

    const onSubmit = (filter: Partial<EmployeeFilter>) => {
        searchParams.delete("query");
        searchParams.set("is-active", `${filter.isActive}`);
        filter.fullName ? searchParams.set("full-name", filter.fullName) : searchParams.delete("full-name");
        filter.securityRoleId ? searchParams.set("security-role-id", filter.securityRoleId) : searchParams.delete("security-role-id");
        filter.securityRole?.name ? searchParams.set("security-role-name", filter.securityRole.name) : searchParams.delete("security-role-name");
        filter.jobTitleId ? searchParams.set("job-title-id", filter.jobTitleId) : searchParams.delete("job-title-id");
        filter.jobTitle?.name ? searchParams.set("job-title-name", filter.jobTitle.name) : searchParams.delete("job-title-name");
        setSearchParams(searchParams);
        handleClickClose();
    }

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="fixed inset-0 z-50 flex justify-end" data-testid="filter-drawer">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClickClose} />
                <aside className="relative box-border bg-card w-full max-w-md h-full border-l border-border shadow-2xl flex flex-col animate-slide-in-right">
                    <div className="h-22 flex items-center justify-between px-10 border-b border-border">
                        <h3 className="font-heading text-xl font-bold uppercase">
                            {title}
                        </h3>
                        <Button onClick={handleClickClose} data-testid="filter-drawer-close" className="min-w-10 min-h-10 bg-card text-foreground !px-0">
                            <X className="!w-5 !h-5 text-muted-foreground" />
                        </Button>
                    </div>

                    <section className="flex-1 overflow-y-auto px-10 py-10 space-y-5">
                        <section className="flex flex-col gap-8">
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
                                <label className="label">Puesto de trabajo:</label>
                                <Controller
                                    name="jobTitleId"
                                    control={control}
                                    render={({ field }) => (
                                        <SearchInput
                                            {...field}
                                            defaultValue={jobTitle?.name}
                                            selected={!!jobTitleId}
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
                            </div>

                            <div className="control-container">
                                <label className="label">Rol de seguridad:</label>
                                <Controller
                                    name="securityRoleId"
                                    control={control}
                                    render={({ field }) => (
                                        <SearchInput
                                            {...field}
                                            defaultValue={securityRole?.name}
                                            selected={!!securityRoleId}
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
                            </div>

                            <div className="control-container">
                                <label className="label">¿Registro activo?:</label>
                                <div className="flex items-center justify-center">
                                    <Controller
                                        name="isActive"
                                        control={control}
                                        render={({ field }) => (
                                            <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-transparent dark:bg-muted/40 border border-border cursor-pointer transition-colors">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{field.value ? "Activo" : "Inactivo"}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">El registro de empleado se encuentra activo o inactivo.</p>
                                                </div>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </label>
                                        )}
                                    />
                                </div>
                            </div>
                        </section>
                    </section>

                    <section className="px-8 py-6 border-t border-border flex items-center justify-between gap-3 box-border">
                        <Button type="button" variant={"ghost"} onClick={handleClickClearFilters}>
                            Limpiar filtros
                        </Button>
                        <Button type="submit" variant={"default"}>
                            Aplicar filtros
                        </Button>
                    </section>

                </aside>
                
            </form>
        </>
    );
}
