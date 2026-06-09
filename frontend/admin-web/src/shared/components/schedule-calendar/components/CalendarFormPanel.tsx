import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { labelOf } from "@/types/KeyValuePair";
import { SLOT_MIN } from "../lib/schedule-calendar-consts";
import type { Employee } from "@/interfaces/entites/employee";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { DAY_OF_WEEKS, type AcademicCycleGroupSchoolSubjectCalendar } from "@/interfaces/entites/academic-cycle-group-school-subject-calendar";

interface Props {
    teachers: Employee[];
    schoolSubjects: SchoolSubject[];
    calendar?: Partial<AcademicCycleGroupSchoolSubjectCalendar>;
    onCancel: () => void;
    onSubmit: (calendarLike: Partial<AcademicCycleGroupSchoolSubjectCalendar>) => void;
}

export const CalendarFormPanel = ({ teachers = [], schoolSubjects = [], calendar = undefined, onCancel, onSubmit }: Props) => {

    // React hook form config
    const { control, formState: { errors }, handleSubmit, reset, watch, setValue } = useForm<Partial<AcademicCycleGroupSchoolSubjectCalendar>>({
        defaultValues: {
            ...calendar
        }
    });

    useEffect(() => {
        if (calendar)
            reset({ ...calendar });
    }, [calendar]);

    return (
        <>
            {/* Schedule calendar form */}
            <section className="fixed inset-0 z-50 flex justify-end" data-testid="filter-drawer">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
                <aside className="relative box-border bg-card w-full max-w-md h-full border-l border-border shadow-2xl flex flex-col animate-slide-in-right">
                    <div className="h-22 flex items-center justify-between px-10 border-b border-border">
                        <h3 className="font-heading text-xl font-bold uppercase">
                            ASIGNACIÓN DE HORARIO
                        </h3>
                        <Button onClick={onCancel} data-testid="filter-drawer-close" className="min-w-10 min-h-10 bg-card text-foreground !px-0">
                            <X className="!w-5 !h-5 text-muted-foreground" />
                        </Button>
                    </div>
                    {/* Schedule calendar fiels */}
                    <section className="flex-1 overflow-y-auto px-10 py-10 space-y-5">
                        <div className="flex flex-col gap-8">
                            <div className="control-container">
                                <label className="label">Día de la semana <span className="required">*</span>:</label>
                                <Controller
                                    control={control}
                                    name="day"
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value ?? ""}
                                            onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una opción">
                                                    {!field.value ? "Selecciona una opción" : labelOf(DAY_OF_WEEKS, field.value)}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Día de la semana</SelectLabel>
                                                    {DAY_OF_WEEKS.map((item) => (
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
                                    errors.day && (
                                        <p className="error">
                                            El día de la asignación de la materia es requerido
                                        </p>
                                    )
                                }
                            </div>
                            <div className="control-container">
                                <label className="label">Hora de inicio de clase <span className="required">*</span>:</label>
                                <Controller
                                    control={control}
                                    name="startTime"
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Input
                                            type="time"
                                            placeholder="Inicio de clase"
                                            step={60 * SLOT_MIN}
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                {
                                    errors.startTime && (
                                        <p className="error">
                                            La hora de inicio de clase es requerido
                                        </p>
                                    )
                                }
                            </div>
                            <div className="control-container">
                                <label className="label">Hora de termino de clase <span className="required">*</span>:</label>
                                <Controller
                                    control={control}
                                    name="endTime"
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Input
                                            type="time"
                                            placeholder="Termino de clase"
                                            step={60 * SLOT_MIN}
                                            value={field.value ?? ""}
                                            onChange={field.onChange}
                                        />
                                    )}
                                />
                                {
                                    errors.endTime && (
                                        <p className="error">
                                            La hora de termino de clase es requerido
                                        </p>
                                    )
                                }
                            </div>
                            <div className="control-container">
                                <label className="label">Materia escolar<span className="required">*</span>:</label>
                                <Controller
                                    control={control}
                                    name="schoolSubjectId"
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value ?? ""}
                                            onValueChange={(value) => {
                                                setValue("schoolSubject", schoolSubjects.find(item => item.id === value));
                                                field.onChange(value);
                                            }}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una opción">
                                                    {!field.value ? "Selecciona una opción" : schoolSubjects.find(item => item.id === field.value)?.name}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Materias escolares disponibles</SelectLabel>
                                                    {
                                                        schoolSubjects.map((item) => (
                                                            <SelectItem key={item.id} value={item.id} label={item.name}>
                                                                {item.name}
                                                            </SelectItem>
                                                        ))
                                                    }
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {
                                    errors.schoolSubjectId && (
                                        <p className="error">
                                            La materia escolar es requerida
                                        </p>
                                    )
                                }
                            </div>
                            <div className="control-container">
                                <label className="label">Docente <span className="required">*</span>:</label>
                                <Controller
                                    control={control}
                                    name="teacherId"
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value ?? ""}
                                            onValueChange={(value) => {
                                                setValue("teacher", teachers.find(item => item.id === value));
                                                field.onChange(value);
                                            }}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una opción">
                                                    {!field.value ? "Selecciona una opción" : teachers.find(item => item.id === field.value)?.name}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Docentes registrados</SelectLabel>
                                                    {
                                                        teachers.map((item) => (
                                                            <SelectItem key={item.id} value={item.id} label={item.email}>
                                                                {`${item.name  ?? ""} ${item.firstLastName  ?? ""} ${item.secondLastName ?? ""}`}
                                                                <br />
                                                                {item.email}
                                                            </SelectItem>
                                                        ))
                                                    }
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {
                                    errors.teacherId && (
                                        <p className="error">
                                            El docente que imparte la materia requerido
                                        </p>
                                    )
                                }
                            </div>
                        </div>
                    </section>
                    {/* Actions Buttons */}
                    <section className="px-8 py-6 border-t border-border flex items-center justify-between gap-3 box-border">
                        <Button type="button" aria-label="cancel" variant={"ghost"} onClick={onCancel}>
                            Cancelar
                        </Button>
                        <Button type="submit" aria-label="save-record" onClick={handleSubmit(onSubmit)}>
                            {!watch("id") ? "Guardar horario" : "Actualizar horario"}
                        </Button>
                    </section>
                </aside>
            </section>
        </>
    )
}
