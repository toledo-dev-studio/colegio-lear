import { useEffect } from "react";
import { useOutletContext, useSearchParams } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { Search } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import type { AcademicCycleSchoolGroupEnrollmentStatusKey } from "@/types/KeyValuePair";
import { TabSectionTitle } from "@/shared/components/tab-section-title/TabSectionTitle";
import type { AcademicCycleSchoolGroup } from "@/interfaces/entites/academic-cycle-school-group";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { ACADEMIC_CYCLE_SCHOOL_GROUP_ENROLLMENT_STATUSES } from "@/interfaces/entites/academic-cycle-school-group-enrollment";
import type { AcademicCycleSchoolGroupEnrollmentFilter } from "@/modules/academic-cycles/interfaces/academic-cycle-school-group-enrollment-filter";

interface Props {
    isLoading: boolean;
    academicCycleSchoolGroups: AcademicCycleSchoolGroup[];
    handleAddEnrollment: () => void;
}

export const AcademicCycleEnrollmentsFilters = ({ academicCycleSchoolGroups, isLoading, handleAddEnrollment }: Props) => {
    // Get context from layout
    const { academicCycle, isLocked, isActive } = useOutletContext<AcademicCycleLayoutContext>();

    // Componet hooks and stores
    const [searchParams, setSearchParams] = useSearchParams();

    // Use react hook form configuration
    const { control, handleSubmit, formState: { errors }, watch } = useForm<AcademicCycleSchoolGroupEnrollmentFilter>({
        defaultValues: {
            query: isValidValueWithDefault(searchParams.get("query"), ""),
            academicCycleSchoolGroupId: isValidValueWithDefault(searchParams.get("school-group-id"), academicCycleSchoolGroups.length > 0 ? academicCycleSchoolGroups[0].id : ""),
            status: isValidValueWithDefault<AcademicCycleSchoolGroupEnrollmentStatusKey | undefined>(searchParams.get("status") as AcademicCycleSchoolGroupEnrollmentStatusKey, undefined)
        }
    });
    const academicCycleSchoolGroupId = watch("academicCycleSchoolGroupId") ?? undefined;

    // Component functions
    const onSubmit = (enrollmentLike: AcademicCycleSchoolGroupEnrollmentFilter) => {
        enrollmentLike.query ? searchParams.set("query", enrollmentLike.query) : searchParams.delete("query");
        enrollmentLike.academicCycleSchoolGroupId ? searchParams.set("school-group-id", enrollmentLike.academicCycleSchoolGroupId) : searchParams.delete("school-group-id");
        enrollmentLike.status ? searchParams.set("status", enrollmentLike.status) : searchParams.delete("status");
        setSearchParams(searchParams);
    }

    useEffect(() => {
        if (academicCycleSchoolGroupId)
            onSubmit({ academicCycleSchoolGroupId: academicCycleSchoolGroupId });
    }, [])

    return (
        <>
            <form className="flex flex-col gap-y-8" onSubmit={handleSubmit(onSubmit)}>
                <section className="flex flex-col gap-y-6 mt-2">
                    <TabSectionTitle
                        title="LISTADO DE ESTUDIANTES INSCRITOS AL CICLO ESCOLAR"
                        description="El siguiente listado contiene la información de los estudiantes inscritos al ciclo escolar según el grupo escolar seleccionado." />

                    {/* Fields */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="control-container">
                            <label className="label">
                                Grupo escolar <span className="required">*</span>:
                            </label>
                            <Controller
                                control={control}
                                name={"academicCycleSchoolGroupId"}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una opción">
                                                {!field.value ? "Selecciona una opción" : academicCycleSchoolGroups.find(item => item.id === field.value)?.name}
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
                            {
                                (errors.academicCycleSchoolGroupId && !academicCycleSchoolGroupId) && (
                                    <p className="text-red-500 text-sm mt-2">
                                        El grupo escolar es obligatorio
                                    </p>
                                )
                            }
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
                                                {!field.value ? "Selecciona una opción" : ACADEMIC_CYCLE_SCHOOL_GROUP_ENROLLMENT_STATUSES.find(item => item.key === field.value)?.label}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Grupos escolares</SelectLabel>
                                                {ACADEMIC_CYCLE_SCHOOL_GROUP_ENROLLMENT_STATUSES.map((item) => (
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
                        <div className="control-container col-span-2">
                            <label className="label">Búsqueda:</label>
                            <Controller
                                control={control}
                                name="query"
                                render={({ field }) => (
                                    <div className="relative">
                                        <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            {...field}
                                            type="text"
                                            placeholder="Búsqueda general..."
                                        />
                                    </div>
                                )}
                            />
                        </div>
                    </section>
                </section>

                {/* Actions section */}
                <section className="flex items-center justify-end gap-x-4 border-b border-border pb-8">
                    <Button type="submit" variant="outilne-primary" disabled={isLoading}>
                        Aplicar filtros
                    </Button>
                    {
                        (academicCycle?.enrollmentOpen && (isActive || !isLocked)) && (
                            <Button type="button" variant="default" disabled={isLoading} onClick={handleAddEnrollment}>
                                Nueva inscripción
                            </Button>
                        )
                    }
                </section>

            </form>
        </>
    )
}
