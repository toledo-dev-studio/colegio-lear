import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
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
                                    <label className="switch-control-container">
                                        <div>
                                            <p className="label">{field.value ? "Activo" : "Inactivo"}</p>
                                            <p className="description">El registro de empleado se encuentra activo o inactivo.</p>
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
