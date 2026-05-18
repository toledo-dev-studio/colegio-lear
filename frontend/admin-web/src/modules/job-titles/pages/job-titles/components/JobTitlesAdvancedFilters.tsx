import { Controller, useForm } from "react-hook-form";
import { useSearchParams } from "react-router";
import { X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import type { JobTitle, JobTitleTypes } from "@/interfaces/entites/job-title.interface";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const JobTitlesAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {

    const [searchParams, setSearchParams] = useSearchParams();
    const jobTitleLikeFilter: Partial<JobTitle> = {
        name: searchParams.get('name') ?? '',
        jobTitleType: (searchParams.get('job-title-type') as JobTitleTypes) ?? undefined,
        status: stringToBooleanWithDefault(searchParams.get('status'))
    };

    const {
        control,
        register,
        handleSubmit,
        setValue,
        reset,
        watch
    } = useForm<Partial<JobTitle>>({
        defaultValues: jobTitleLikeFilter
    });

    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete('query');
        searchParams.delete('name');
        searchParams.delete('status');
        searchParams.delete('job-title-type');
        reset({ name: '', status: true, jobTitleType: undefined });
        setSearchParams(searchParams);
        handleClickClose();
    }

    const handleSubmitForm = (filter: Partial<JobTitle>) => {
        searchParams.delete('query');
        searchParams.set('status', `${filter.status}`);
        filter.name ? searchParams.set('name', filter.name) : searchParams.delete('name');
        filter.jobTitleType ? searchParams.set('job-title-type', filter.jobTitleType) : searchParams.delete('job-title-type');
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
                        <Button onClick={handleClickClose} data-testid="filter-drawer-close" className="min-w-10 min-h-10 bg-card text-foreground !px-0">
                            <X className="!w-5 !h-5 text-muted-foreground" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-10 py-10 space-y-5">
                        {/* Contenido de filtrados */}
                        <div className="flex flex-col gap-8">
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Nombre:</label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        {...register('name')}
                                        placeholder="Nombre del puesto de trabajo..."
                                        className="pill-input w-full pl-8"
                                    />
                                </div>
                            </div>

                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-3 block">
                                    Tipo del puesto de trabajo:
                                </label>
                                <Controller
                                    control={control}
                                    name='jobTitleType'
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
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
                                    )} />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">Estatus:</label>
                                <Switch
                                    size="default"
                                    checked={watch('status')}
                                    onCheckedChange={(checked) => setValue('status', checked)} />
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
