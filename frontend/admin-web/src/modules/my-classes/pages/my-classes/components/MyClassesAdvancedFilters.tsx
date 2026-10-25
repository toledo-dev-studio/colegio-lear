import { useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/shadcn/ui/input";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import type { MyClassFilter } from "@/interfaces/filters/my-class.filter";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import type { AcademicCycleStatusKey, AcademicCycleSchoolGroupStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";
import { ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES, ACADEMIC_CYCLE_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/shadcn/ui/select";

interface Props {
    open: boolean;
    title?: string;
    handleClickClose: () => void;
}

export const MyClassesAdvancedFilters = ({ open, title = "Filtros avanzados", handleClickClose }: Props) => {
    // Component hooks & stores
    const [searchParams, setSearchParams] = useSearchParams();

    const myClassFilterLike: Partial<MyClassFilter> = {
        name: isValidValueWithDefault(searchParams.get("name")?.trim(), ""),
        status: isValidValueWithDefault(searchParams.get("status")?.trim() as AcademicCycleSchoolGroupStatusKey, undefined),
        academicCycleStatus: isValidValueWithDefault(searchParams.get("academic-cycle-status")?.trim() as AcademicCycleStatusKey, undefined),
    };

    // Use react hook form configuration
    const { control, handleSubmit, reset } = useForm<Partial<MyClassFilter>>({
        defaultValues: myClassFilterLike
    });

    if (!open)
        return null;

    const handleClickClearFilters = () => {
        searchParams.delete("name");
        searchParams.delete("status");
        searchParams.delete("academic-cycle-status");
        reset({});
        setSearchParams(searchParams);
        handleClickClose();
    }

    const onSubmit = (filter: Partial<MyClassFilter>) => {
        searchParams.delete("query");
        filter.name ? searchParams.set("name", filter.name) : searchParams.delete("name");
        filter.status ? searchParams.set("status", `${filter.status}`) : searchParams.delete("status");
        filter.academicCycleStatus ? searchParams.set("academic-cycle-status", `${filter.academicCycleStatus}`) : searchParams.delete("academic-cycle-status");
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
                        <label className="label">Nombre del grupo escolar:</label>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    type="text"
                                    placeholder="Nombre del grupo escolar..."
                                />
                            )}
                        />
                    </div>

                    <div className="control-container">
                        <label className="label">Estatus del grupo escolar:</label>
                        <Controller
                            control={control}
                            name="status"
                            render={({ field }) => (
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona una opción">
                                            {labelOf(ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES, field.value) || "Selecciona una opción"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Estatus del grupo escolar</SelectLabel>
                                            {ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES.map((item) => (
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
                        <label className="label">Estatus del ciclo escolar:</label>
                        <Controller
                            control={control}
                            name="academicCycleStatus"
                            render={({ field }) => (
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona una opción">
                                            {labelOf(ACADEMIC_CYCLE_STATUSES, field.value) || "Selecciona una opción"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Estatus del ciclo escolar</SelectLabel>
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
                </form>
            </SidePanel>
        </>
    );
}