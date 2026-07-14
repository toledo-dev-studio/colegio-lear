import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import type { JobTitleFilter } from "@/interfaces/filters/job-title.filter";
import type { JobTitleTypeKey } from "@/lib/key-value-pairs/key-value-pair-types";
import { isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const JobTitlesAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {
    // Component hooks & stores
    const [searchParams, setSearchParams] = useSearchParams();
    const jobTitleLikeFilter: Partial<JobTitleFilter> = {
        name: isValidValueWithDefault(searchParams.get("name"), ""),
        jobTitleType: isValidValueWithDefault(searchParams.get("job-title-type") as JobTitleTypeKey, undefined),
        isActive: stringToBooleanWithDefault(searchParams.get("is-active"))
    };

    // Use react hook form configuration
    const { control, handleSubmit, reset } = useForm<Partial<JobTitleFilter>>({
        defaultValues: jobTitleLikeFilter
    });

    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete("query");
        searchParams.delete("name");
        searchParams.delete("is-active");
        searchParams.delete("job-title-type");
        reset({ name: "", isActive: true, jobTitleType: undefined });
        setSearchParams(searchParams);
        handleClickClose();
    }

    const onSubmit = (filter: Partial<JobTitleFilter>) => {
        searchParams.delete("query");
        searchParams.set("is-active", `${filter.isActive}`);
        filter.name ? searchParams.set("name", filter.name) : searchParams.delete("name");
        filter.jobTitleType ? searchParams.set("job-title-type", filter.jobTitleType) : searchParams.delete("job-title-type");
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
                        <label className="label">Nombre del rol de seguridad:</label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    type="text"
                                    {...field}
                                    placeholder="Nombre del rol de seguridad..."
                                />
                            )} />
                    </div>

                    <div className="control-container">
                        <label className="label">Tipo del puesto de trabajo:</label>
                        <Controller
                            control={control}
                            name="jobTitleType"
                            render={({ field }) => (
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona un puesto de trabajo">
                                            {field.value === "teacher" && "Docente"}
                                            {field.value === "administrative-staff" && "Administrativo"}
                                            {!field.value && "Selecciona una opción"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Tipos de puesto de trabajo</SelectLabel>
                                            <SelectItem value="administrative-staff" label="Administrativo">Administrativo</SelectItem>
                                            <SelectItem value="teacher" label="Docente">Docente</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
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
                                            <p className="description">El rol de seguridad se encuentra activo o inactivo.</p>
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
