import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { SearchInput } from "@/shared/components/search-input/SearchInput";
import type { ScholarshipResponse } from "@/interfaces/responses/scholarship.response";
import { useSearchScholarships } from "@/modules/scholarships/hooks/useSearchScholarships";
import { ACADEMIC_CYCLE_ENROLLMENT_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { AcademicCycleEnrollmentStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";
import type { AcademicCycleEnrollmentFilter } from "@/interfaces/filters/academic-cycle-enrollment.filter";
import type { AcademicCycleSchoolGroupResponse } from "@/interfaces/responses/academic-cycle-school-group.response";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/shadcn/ui/select";

interface Props {
    academicCycleSchoolGroups: AcademicCycleSchoolGroupResponse[];
    handleClickClose: () => void;
}

export const AcademicCycleEnrollmentsPanelFilters = ({ academicCycleSchoolGroups, handleClickClose }: Props) => {
    // Component hooks & stores
    const [searchParams, setSearchParams] = useSearchParams();
    const searchScholarships = useSearchScholarships();

    const academicCycleEnrollmentFilterLike: Partial<AcademicCycleEnrollmentFilter> = {
        academicCycleSchoolGroupId: isValidValueWithDefault(searchParams.get("school-group-id")?.trim(), ""),
        scholarshipId: isValidValueWithDefault(searchParams.get("scholarship-id")?.trim(), ""),
        scholarship: {
            name: isValidValueWithDefault(searchParams.get("scholarship-name")?.trim(), ""),
        },
        status: isValidValueWithDefault(searchParams.get("status")?.trim() as AcademicCycleEnrollmentStatusKey, undefined),
    };

    // Use react hook form configuration
    const { control, handleSubmit, setValue, reset, watch } = useForm<Partial<AcademicCycleEnrollmentFilter>>({
        defaultValues: academicCycleEnrollmentFilterLike
    });
    const scholarship = watch("scholarship");
    const scholarshipId = watch("scholarshipId");

    const handleClickClearFilters = () => {
        searchParams.delete("school-group-id");
        searchParams.delete("school-group-name");
        searchParams.delete("scholarship-id");
        searchParams.delete("scholarship-name");
        searchParams.delete("status");
        reset({});
        setSearchParams(searchParams);
        handleClickClose();
    }

    const onSubmit = (filter: Partial<AcademicCycleEnrollmentFilter>) => {
        filter.status ? searchParams.set("status", `${filter.status}`) : searchParams.delete("status");
        filter.academicCycleSchoolGroupId ? searchParams.set("school-group-id", filter.academicCycleSchoolGroupId) : searchParams.delete("school-group-id");
        filter.scholarshipId ? searchParams.set("scholarship-id", filter.scholarshipId) : searchParams.delete("scholarship-id");
        filter.scholarship?.name ? searchParams.set("scholarship-name", filter.scholarship.name) : searchParams.delete("scholarship-name");
        setSearchParams(searchParams);
        handleClickClose();
    }

    return (
        <>
            <SidePanel
                title="FILTROS AVANZADOS"
                handleClickClose={handleClickClose}
                cancelButton={{ show: true, disabled: false, type: "button", label: "Limpiar filtros", handleClick: handleClickClearFilters }}
                submitButton={{ show: true, disabled: false, type: "submit", label: "Aplicar filtros", handleClick: handleSubmit(onSubmit) }}>

                <form className="flex flex-col gap-8">

                    <div className="control-container">
                        <label className="label">
                            Grupo escolar <span className="required">*</span>:
                        </label>
                        <Controller
                            control={control}
                            name={"academicCycleSchoolGroupId"}
                            render={({ field }) => (
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una opción">
                                            {field.value ? academicCycleSchoolGroups.find(item => item.id === field.value)?.name : "Selecciona una opción"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Grupos escolares</SelectLabel>
                                            {academicCycleSchoolGroups.map((item) => (
                                                <SelectItem key={item.id} value={item.id} label={item.name}>
                                                    {item.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">
                            Estatus de inscripción:
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
                                            {!field.value ? "Selecciona una opción" : labelOf(ACADEMIC_CYCLE_ENROLLMENT_STATUSES, field.value)}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Grupos escolares</SelectLabel>
                                            {ACADEMIC_CYCLE_ENROLLMENT_STATUSES.map((item) => (
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
                        <label className="label">Beca asignada:</label>
                        <Controller
                            name="scholarshipId"
                            control={control}
                            render={({ field }) => (
                                <SearchInput
                                    {...field}
                                    defaultValue={scholarship?.name}
                                    selected={!!scholarshipId}
                                    placeholder="Busqueda de beca"
                                    options={searchScholarships.scholarships}
                                    isSearching={searchScholarships.isPending}
                                    onClearSelection={() => {
                                        setValue("scholarship", undefined);
                                        setValue("scholarshipId", undefined);
                                        searchScholarships.clearSearchResult();
                                    }}
                                    onOptionChange={async (option: ScholarshipResponse) => {
                                        setValue("scholarship", option);
                                        setValue("scholarshipId", option.id);
                                        searchScholarships.clearSearchResult();
                                    }}
                                    onSearch={async (query) => searchScholarships.searchAsync({ query, isActive: true })}
                                />
                            )}
                        />
                    </div>

                </form>

            </SidePanel>
        </>
    );
}
