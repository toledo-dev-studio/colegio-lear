import { useEffect } from "react";
import { useOutletContext } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import type { Employee } from "@/interfaces/entites/employee";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";
import ScheduleCalendar from "@/shared/components/schedule-calendar/ScheduleCalendar";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { AcademicCycleGroupSchoolSubjectCalendar } from "@/interfaces/entites/academic-cycle-group-school-subject-calendar";
import { ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES, type AcademicCycleSchoolGroup } from "@/interfaces/entites/academic-cycle-school-group";

interface Props {
    teachers: Employee[];
    schoolSubjects: SchoolSubject[];
    academicCycleSchoolGroup?: Partial<AcademicCycleSchoolGroup | undefined>;
    setAcademicCycleSchoolGroup: React.Dispatch<React.SetStateAction<Partial<AcademicCycleSchoolGroup> | undefined>>;
    onSubmit: (academicCycleSchoolGroupLike: Partial<AcademicCycleSchoolGroup>) => void;
}

export const AcademicCycleSchoolGroupForm = ({ academicCycleSchoolGroup, teachers, schoolSubjects, setAcademicCycleSchoolGroup, onSubmit }: Props) => {
    // Get context from layout
    const { academicCycleId } = useOutletContext<AcademicCycleLayoutContext>();

    // Use react hook form configuration
    const { control, handleSubmit, formState: { errors }, setFocus, watch, reset } = useForm<Partial<AcademicCycleSchoolGroup>>({
        defaultValues: {
            id: academicCycleSchoolGroup?.id,
            name: academicCycleSchoolGroup?.name ?? "",
            status: academicCycleSchoolGroup?.status,
            description: academicCycleSchoolGroup?.description ?? "",
            dischargedDescription: academicCycleSchoolGroup?.dischargedDescription ?? "",
            calendars: academicCycleSchoolGroup?.calendars ?? [],
            academicCycleId: academicCycleId,
        }
    });
    const isNewRecord = watch("id") === undefined;
    const isDischarged = watch("status") === "discharged";

    useEffect(() => {
        requestAnimationFrame(() => {
            reset({
                id: academicCycleSchoolGroup?.id,
                name: academicCycleSchoolGroup?.name ?? "",
                status: academicCycleSchoolGroup?.status,
                description: academicCycleSchoolGroup?.description ?? "",
                dischargedDescription: academicCycleSchoolGroup?.dischargedDescription ?? "",
                calendars: academicCycleSchoolGroup?.calendars ?? [],
                academicCycleId: academicCycleId,
            });
            if (academicCycleSchoolGroup?.id)
                requestAnimationFrame(() => setFocus("name"));
        });
    }, [academicCycleSchoolGroup]);


    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-8">
                <section className="flex flex-col gap-y-6 mt-2 border-b border-border pb-8">
                    <SectionTitle
                        title="REGISTRO & EDICIÓN DE GRUPOS ESCOLARES"
                        description="En esta sección podrás configurar aquellos grupos escolares que estarán disponibles para los alumnos al momento de su incripción en el ciclo escolar." />

                    {/* Fields */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="control-container">
                            <label className="label">Nombre del grupo escolar <span className="required">*</span>:</label>
                            <Controller
                                control={control}
                                name="name"
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        type="text"
                                        placeholder="Nombre del grupo escolar"
                                    />
                                )}
                            />
                            {
                                errors.name && (
                                    <p className="error">
                                        El nombre del grupo es requerido
                                    </p>
                                )
                            }
                        </div>
                        <div className="control-container">
                            <label className="label">Estatus del grupo <span className="required">*</span>:</label>
                            <Controller
                                control={control}
                                name="status"
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona una opción">
                                                {!field.value ? "Selecciona una opción" : ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES.find(item => item.key === field.value)?.label}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Estatus del grupo</SelectLabel>
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
                            {
                                errors.status && (
                                    <p className="error">
                                        El estatus del grupo es requerido
                                    </p>
                                )
                            }
                        </div>
                    </section>
                    <section className="grid grid-cols-1 gap-8">
                        <div className="control-container">
                            <label className="label">Descripción:</label>
                            <Controller
                                name="description"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        placeholder="-"
                                    />
                                )}
                            />
                        </div>
                        {
                            isDischarged && (
                                <div className="control-container">
                                    <label className="label">Razón de baja de grupo <span className="required">*</span>:</label>
                                    <Controller
                                        name="dischargedDescription"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field }) => (
                                            <Textarea
                                                {...field}
                                                placeholder="-"
                                            />
                                        )}
                                    />
                                    {
                                        errors.dischargedDescription && (
                                            <p className="error">
                                                Es necesario agregar una razón de la baja del grupo
                                            </p>
                                        )
                                    }
                                </div>
                            )
                        }
                    </section>

                    {/* Schedule calendar for school group */}
                    <SectionTitle
                        title="CONFIGURACIÓN DE HORARIO ESCOLAR"
                        description="Edita el horario escolar para el grupo por registrar o actualizar." />

                    <section className="flex flex-col gap-y-6">
                        <Controller
                            name="calendars"
                            control={control}
                            render={({ field }) => (
                                <ScheduleCalendar
                                    disabled={false}
                                    teachers={teachers}
                                    calendars={field.value ?? []}
                                    schoolSubjects={schoolSubjects}
                                    onChangeCalendars={(calendars: AcademicCycleGroupSchoolSubjectCalendar[]) => { field.onChange(calendars) }} />
                            )}
                        />
                    </section>
                </section>

                {/* Actions section */}
                <section className="flex items-center justify-end gap-x-4">
                    {
                        !isNewRecord &&
                        <Button type="button" aria-label="cancel" variant={"ghost"} onClick={() => setAcademicCycleSchoolGroup({})}>
                            Cancelar
                        </Button>
                    }
                    <Button type="submit">
                        {
                            isNewRecord ? "Crear nuevo grupo" : "Actualizar grupo"
                        }
                    </Button>
                </section>
            </form>
        </>
    )
}
