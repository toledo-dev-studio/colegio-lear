import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import type { JobTitleFilter } from "@/interfaces/filters/job-title.filter";
import { isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { JobTitleTypeKey } from "@/lib/key-value-pairs/key-value-pair-types";

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

    const handleSubmitForm = (filter: Partial<JobTitleFilter>) => {
        searchParams.delete("query");
        searchParams.set("is-active", `${filter.isActive}`);
        filter.name ? searchParams.set("name", filter.name) : searchParams.delete("name");
        filter.jobTitleType ? searchParams.set("job-title-type", filter.jobTitleType) : searchParams.delete("job-title-type");
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
                        <Button onClick={handleClickClose} data-testid="filter-drawer-close" className="min-w-10 min-h-10 bg-card text-foreground px-0!">
                            <X className="w-5! h-5! text-muted-foreground" />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-10 py-10 space-y-5">
                        
                        <section className="flex flex-col gap-8">
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
                                            <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-muted/40 border border-border cursor-pointer hover:bg-muted/60 transition-colors">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{field.value ? "Activo" : "Inactivo"}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">El rol de seguridad se encuentra activo o inactivo.</p>
                                                </div>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </label>
                                        )}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

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
