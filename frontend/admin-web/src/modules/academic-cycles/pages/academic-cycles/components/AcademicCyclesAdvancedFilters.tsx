import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Switch } from "@/shared/ui/switch";
import { isValidBooleanString, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { CustomDatePicker } from "@/shared/components/CustomDatePicker";
import { ACADEMIC_CYCLE_PERIOD_TYPES, ACADEMIC_CYCLE_STATUSES, type AcademicCycle } from "@/interfaces/entites/academic-cycle";
import type { AcademicCycleStatusKey, AcademicPeriodTypeKey } from "@/types/KeyValuePair";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { useSearchAcademicLevels } from "@/modules/academic-levels/hooks/academic-levels/useSearchAcademicLevels";
import { useSearchEducationLevelsForAcademicLevel } from "@/modules/academic-levels/hooks/education-levels/useSearchEducationLevelsForAcademicLevel";
import type { AcademicLevel } from "@/interfaces/entites/academic-level";
import { CustomSearchInput } from "@/shared/components/CustomSearchInput";
import type { EducationLevel } from "@/interfaces/entites/education-level";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const AcademicCyclesAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {

    // Main hooks
    const [searchParams, setSearchParams] = useSearchParams();

    // Form config
    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
    } = useForm<Partial<AcademicCycle>>({
        defaultValues: {
            name: searchParams.get("name") || undefined,
            code: searchParams.get("code") || undefined,
            startDate: searchParams.get("start-date") || undefined,
            endDate: searchParams.get("end-date") || undefined,
            academicLevelId: searchParams.get('academic-level-id') ?? undefined,
            academicLevel: {
                name: searchParams.get('academic-level-name') ?? undefined,
            },
            educationLevelId: searchParams.get('education-level-id') ?? undefined,
            educationLevel: {
                name: searchParams.get('education-level-name') ?? undefined,
            },
            type: searchParams.get("type") as AcademicPeriodTypeKey || undefined,
            enrollmentOpen: isValidBooleanString(searchParams.get("enrollment-open")) ? stringToBooleanWithDefault(searchParams.get("enrollment-open")) : undefined,
            status: searchParams.get("status") as AcademicCycleStatusKey || undefined,
        }
    });

    const selectedAcademicLevel = watch("academicLevelId");
    const selectedEducationLevel = watch("educationLevelId");

    // Academic levels assign configuration
    const searchAcademicLevelsForSchoolSubject = useSearchAcademicLevels();

    // Education levels assign configuration
    const searchEducationLevelsForAcademicLevel = useSearchEducationLevelsForAcademicLevel();

    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete("name");
        searchParams.delete("code");
        searchParams.delete("start-date");
        searchParams.delete("end-date");
        searchParams.delete('academic-level-id');
        searchParams.delete('academic-level-name');
        searchParams.delete('education-level-id');
        searchParams.delete('education-level-name');
        searchParams.delete("type");
        searchParams.delete("enrollment-open");
        searchParams.delete("status");
        reset({
            name: undefined,
            code: undefined,
            startDate: undefined,
            endDate: undefined,
            type: undefined,
            enrollmentOpen: false,
            status: undefined,
        });
        setSearchParams(searchParams);
        handleClickClose();
    }

    const handleSubmitForm = (filter: Partial<AcademicCycle>) => {
        searchParams.delete("query");
        searchParams.set("enrollment-open", `${filter.enrollmentOpen}`);
        filter.name ? searchParams.set("name", filter.name) : searchParams.delete("name");
        filter.code ? searchParams.set("code", filter.code) : searchParams.delete("code");
        filter.startDate ? searchParams.set("start-date", filter.startDate) : searchParams.delete("start-date");
        filter.endDate ? searchParams.set("end-date", filter.endDate) : searchParams.delete("end-date");
        filter.academicLevelId ? searchParams.set('academic-level-id', filter.academicLevelId) : searchParams.delete('academic-level-id');
        filter.academicLevel?.name ? searchParams.set('academic-level-name', filter.academicLevel.name) : searchParams.delete('academic-level-name');
        filter.educationLevelId ? searchParams.set('education-level-id', filter.educationLevelId) : searchParams.delete('education-level-id');
        filter.educationLevel?.name ? searchParams.set('education-level-name', filter.educationLevel?.name) : searchParams.delete('education-level-name');
        filter.type ? searchParams.set("type", filter.type) : searchParams.delete("type");
        filter.status ? searchParams.set("status", `${filter.status}`) : searchParams.delete("status");
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
                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-2 block">Nombre del ciclo:</label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        {...register("name")}
                                        placeholder="Nombre del ciclo..."
                                        className="pill-input w-full pl-8"
                                    />
                                </div>
                            </div>
                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-2 block">Código del ciclo:</label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        {...register("code")}
                                        placeholder="Código del ciclo..."
                                        className="pill-input w-full pl-8"
                                    />
                                </div>
                            </div>
                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-2 block">Entre fecha de inicio:</label>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomDatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                <p className="text-xs text-muted-foreground mt-1.5">Filtrado a partir de fecha de inicio seleccionada</p>
                            </div>
                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-2 block">Hasta fecha de termino:</label>
                                <Controller
                                    name="endDate"
                                    control={control}
                                    render={({ field }) => (
                                        <CustomDatePicker
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                <p className="text-xs text-muted-foreground mt-1.5">Filtrado hasta fecha de termino seleccionada</p>
                            </div>
                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-2 block">Nivel académico:</label>
                                <CustomSearchInput
                                    {...register("academicLevelId")}
                                    defaultValue={watch("academicLevel.name")}
                                    selected={!!selectedAcademicLevel}
                                    placeholder="Busqueda de nivel académico"
                                    options={searchAcademicLevelsForSchoolSubject.academicLevels ?? []}
                                    isSearching={searchAcademicLevelsForSchoolSubject.isPending}
                                    onClearSelection={() => {
                                        setValue("academicLevelId", undefined);
                                        setValue("academicLevel.name", undefined);
                                        setValue("educationLevelId", undefined);
                                        setValue("educationLevel.name", undefined);
                                    }}
                                    onOptionChange={async (option: AcademicLevel) => {
                                        setValue("academicLevelId", option.id);
                                        setValue("academicLevel.name", option.name);
                                        searchAcademicLevelsForSchoolSubject.clearSearchResult();
                                    }}
                                    onSearch={async (query) => searchAcademicLevelsForSchoolSubject.searchAsync(query)}
                                />
                            </div>
                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-2 block">Nivel educativo:</label>
                                <CustomSearchInput
                                    {...register("educationLevelId")}
                                    defaultValue={watch("educationLevel.name")}
                                    selected={!!selectedEducationLevel}
                                    disabled={!selectedAcademicLevel}
                                    placeholder="Busqueda de nivel educativo"
                                    options={searchEducationLevelsForAcademicLevel.educationLevels ?? []}
                                    isSearching={searchEducationLevelsForAcademicLevel.isPending}
                                    onClearSelection={() => {
                                        setValue("educationLevelId", undefined);
                                        setValue("educationLevel.name", undefined);
                                    }}
                                    onOptionChange={async (option: EducationLevel) => {
                                        setValue("educationLevelId", option.id);
                                        setValue("educationLevel.name", option.name);
                                        searchEducationLevelsForAcademicLevel.clearSearchResult();
                                    }}
                                    onSearch={async (query) => searchEducationLevelsForAcademicLevel.searchAsync({
                                        academicLevelId: selectedAcademicLevel!,
                                        query
                                    })}
                                />
                            </div>
                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-3 block">
                                    Tipo de periodo del ciclo escolar:
                                </label>
                                <Controller
                                    control={control}
                                    name={"type"}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value ?? ""}
                                            onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una opción">
                                                    {!field.value ? "Selecciona una opción" : ACADEMIC_CYCLE_PERIOD_TYPES.find(item => item.key === field.value)?.label}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Tipo de periodo</SelectLabel>
                                                    {ACADEMIC_CYCLE_PERIOD_TYPES.map((item) => (
                                                        <SelectItem key={item.key} value={item.key} label={item.label}>
                                                            {item.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-3 block">
                                    Estado del ciclo escolar:
                                </label>
                                <Controller
                                    control={control}
                                    name={"status"}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value ?? ""}
                                            onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una opción">
                                                    {!field.value ? "Selecciona una opción" : ACADEMIC_CYCLE_STATUSES.find(item => item.key === field.value)?.label}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Estado del ciclo escolar</SelectLabel>
                                                    {ACADEMIC_CYCLE_STATUSES.map((item) => (
                                                        <SelectItem key={item.key} value={item.key} label={item.label}>
                                                            {item.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>
                            <div className="w-full">
                                <label className="text-sm font-medium text-foreground mb-3 block">
                                    ¿Inscripciones abiertas?:
                                </label>
                                <div className="flex items-center justify-center">
                                    <Controller
                                        name="enrollmentOpen"
                                        control={control}
                                        defaultValue={false}
                                        render={({ field }) => (
                                            <label className="flex items-center justify-between gap-4 w-full py-4 px-8 rounded-2xl bg-muted/40 border border-border cursor-pointer hover:bg-muted/60 transition-colors">
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{field.value ? "Sí" : "No"}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Ciclo escolar con posibilidad de inscribir nuevos estudiantes.</p>
                                                </div>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </label>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="px-8 py-6 border-t border-border flex items-center justify-between gap-3 box-border">
                        <Button
                            type="button"
                            variant={"ghost"}
                            data-testid="filter-clear-button"
                            className="px-10"
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
