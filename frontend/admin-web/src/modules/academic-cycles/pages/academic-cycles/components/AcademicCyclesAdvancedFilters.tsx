import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import { DatePicker } from "@/shared/components/date-picker/DatePicker";
import { SearchInput } from "@/shared/components/search-input/SearchInput";
import type { AcademicCycleFilter } from "@/interfaces/filters/academic-cycle.filter";
import type { AcademicLevelResponse } from "@/interfaces/responses/academic-level.response";
import type { EducationLevelResponse } from "@/interfaces/responses/education-level.response";
import { isValidValueWithDefault, stringToBooleanWithDefault } from "@/lib/extensions/datatypes";
import { useSearchAcademicLevels } from "@/modules/academic-levels/hooks/academic-levels/useSearchAcademicLevels";
import { type AcademicCycleStatusKey, type AcademicPeriodTypeKey } from "@/lib/key-value-pairs/key-value-pair-types";
import { useSearchEducationLevels } from "@/modules/academic-levels/hooks/education-levels/useSearchEducationLevels";
import { ACADEMIC_CYCLE_PERIOD_TYPES, ACADEMIC_CYCLE_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const AcademicCyclesAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {
    // Component hooks & stores
    const [searchParams, setSearchParams] = useSearchParams();
    const searchAcademicLevels = useSearchAcademicLevels();
    const searchEducationLevels = useSearchEducationLevels();

    const academicCycleFilterLike: Partial<AcademicCycleFilter> = {
        name: isValidValueWithDefault(searchParams.get("name")?.trim(), ""),
        code: isValidValueWithDefault(searchParams.get("code")?.trim(), ""),
        startDate: isValidValueWithDefault(searchParams.get("start-date")?.trim(), ""),
        endDate: isValidValueWithDefault(searchParams.get("end-date")?.trim(), ""),
        periodType: isValidValueWithDefault(searchParams.get("period-type")?.trim() as AcademicPeriodTypeKey, undefined),
        status: isValidValueWithDefault(searchParams.get("status")?.trim() as AcademicCycleStatusKey, undefined),
        enrollmentOpen: stringToBooleanWithDefault(searchParams.get("enrollment-open")),
        academicLevelId: isValidValueWithDefault(searchParams.get("academic-level-id")?.trim(), ""),
        educationLevelId: isValidValueWithDefault(searchParams.get("education-level-id")?.trim(), ""),
        academicLevel: {
            name: isValidValueWithDefault(searchParams.get("academic-level-name")?.trim(), ""),
        },
        educationLevel: {
            name: isValidValueWithDefault(searchParams.get("education-level-name")?.trim(), "")
        },
    };

    // Use react hook form configuration
    const { control, handleSubmit, setValue, reset, watch } = useForm<Partial<AcademicCycleFilter>>({
        defaultValues: academicCycleFilterLike
    });
    const academicLevel = watch("academicLevel");
    const academicLevelId = watch("academicLevelId");
    const educationLevel = watch("educationLevel");
    const educationLevelId = watch("educationLevelId");

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
        searchParams.delete("period-type");
        searchParams.delete("enrollment-open");
        searchParams.delete("status");
        reset({});
        setSearchParams(searchParams);
        handleClickClose();
    }

    const onSubmit = (filter: Partial<AcademicCycleFilter>) => {
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
        filter.periodType ? searchParams.set("period-type", filter.periodType) : searchParams.delete("period-type");
        filter.status ? searchParams.set("status", `${filter.status}`) : searchParams.delete("status");
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
                        <label className="label">Nombre del ciclo escolar:</label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder="Nombre del ciclo escolar..."
                                />
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Código del ciclo escolar:</label>
                        <Controller
                            name="code"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder="Código del ciclo escolar..."
                                />
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Entre fecha de inicio:</label>
                        <Controller
                            name="startDate"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    placeholder="Fecha de inicio"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                        <p className="control-info">Filtrado a partir de fecha de inicio seleccionada</p>
                    </div>

                    <div className="control-container">
                        <label className="label">Hasta fecha de término:</label>
                        <Controller
                            name="endDate"
                            control={control}
                            render={({ field }) => (
                                <DatePicker
                                    {...field}
                                    placeholder="Fecha de término"
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                        <p className="control-info">Filtrado hasta fecha de término seleccionada</p>
                    </div>

                    <div className="control-container">
                        <label className="label">Nivel académico:</label>
                        <Controller
                            name="academicLevelId"
                            control={control}
                            render={({ field }) => (
                                <SearchInput
                                    {...field}
                                    defaultValue={academicLevel?.name}
                                    selected={!!academicLevelId}
                                    placeholder="Busqueda de nivel académico"
                                    options={searchAcademicLevels.academicLevels}
                                    isSearching={searchAcademicLevels.isPending}
                                    onClearSelection={() => {
                                        setValue("academicLevel", undefined);
                                        setValue("academicLevelId", undefined);
                                        setValue("educationLevel", undefined);
                                        setValue("educationLevelId", undefined);
                                        searchAcademicLevels.clearSearchResult();
                                    }}
                                    onOptionChange={async (option: AcademicLevelResponse) => {
                                        setValue("academicLevel", option);
                                        setValue("academicLevelId", option.id);
                                        searchAcademicLevels.clearSearchResult();
                                    }}
                                    onSearch={async (query) => searchAcademicLevels.searchAsync({ query, isActive: true })}
                                />
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Grado educativo:</label>
                        <Controller
                            name="educationLevelId"
                            control={control}
                            render={({ field }) => (
                                <SearchInput
                                    {...field}
                                    defaultValue={educationLevel?.name}
                                    selected={!!educationLevelId}
                                    disabled={!academicLevelId}
                                    placeholder="Busqueda de grado educativo"
                                    options={searchEducationLevels.educationLevels}
                                    isSearching={searchEducationLevels.isPending}
                                    onClearSelection={() => {
                                        setValue("educationLevel", undefined);
                                        setValue("educationLevelId", undefined);
                                        searchEducationLevels.clearSearchResult();
                                    }}
                                    onOptionChange={async (option: EducationLevelResponse) => {
                                        setValue("educationLevel", option);
                                        setValue("educationLevelId", option.id);
                                        searchEducationLevels.clearSearchResult();
                                    }}
                                    onSearch={async (query) => searchEducationLevels.searchAsync({ academicLevelId, query, isActive: true })}
                                />
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Tipo de periodo escolar:</label>
                        <Controller
                            control={control}
                            name="periodType"
                            render={({ field }) => (
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona un puesto de trabajo">
                                            {labelOf(ACADEMIC_CYCLE_PERIOD_TYPES, field.value) || "Selecciona una opción"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Tipo de periodo escolar</SelectLabel>
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

                    <div className="control-container">
                        <label className="label">Estado del ciclo escolar:</label>
                        <Controller
                            control={control}
                            name="status"
                            render={({ field }) => (
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona un puesto de trabajo">
                                            {labelOf(ACADEMIC_CYCLE_STATUSES, field.value) || "Selecciona una opción"}
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

                    <div className="control-container">
                        <label className="label">¿Inscripciones abiertas?:</label>
                        <div className="flex items-center justify-center">
                            <Controller
                                name="enrollmentOpen"
                                control={control}
                                defaultValue={false}
                                render={({ field }) => (
                                    <label className="switch-control-container">
                                        <div>
                                            <p className="label">{field.value ? "Sí" : "No"}</p>
                                            <p className="description">Ciclo escolar con posibilidad de inscribir nuevos estudiantes.</p>
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
