import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { X } from "lucide-react";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import type { Calendar } from "../types/calendar";
import { SLOT_MIN } from "../lib/schedule-calendar-consts";
import { DAY_OF_WEEKS } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";
import { labelOf, type DayOfWeekKey } from "@/lib/key-value-pairs/key-value-pair";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";

interface Props {
    disabled: boolean;
    teachers: EmployeeResponse[];
    schoolSubjects: SchoolSubjectResponse[];
    calendar?: Calendar;
    onCancel: () => void;
    onSubmit: (calendarLike: Partial<Calendar>) => void;
}

export const CalendarFormPanel = ({ disabled = false, teachers = [], schoolSubjects = [], calendar = undefined, onCancel, onSubmit }: Props) => {

    // React hook form config
    const { control, formState: { errors }, trigger, setError, handleSubmit, reset, setValue } = useForm<Partial<Calendar>>({
        defaultValues: {
            day: isValidValueWithDefault(calendar?.day, undefined),
            startTime: isValidValueWithDefault(calendar?.startTime, ""),
            endTime: isValidValueWithDefault(calendar?.endTime, ""),
            academicCycleId: isValidValueWithDefault(calendar?.academicCycleId, ""),
            academicCycle: isValidValueWithDefault(calendar?.academicCycle, undefined),
            academicCycleSchoolGroupId: isValidValueWithDefault(calendar?.academicCycleSchoolGroupId, ""),
            academicCycleSchoolGroup: isValidValueWithDefault(calendar?.academicCycleSchoolGroup, undefined),
            schoolSubjectId: isValidValueWithDefault(calendar?.schoolSubjectId, ""),
            schoolSubject: isValidValueWithDefault(calendar?.schoolSubject, undefined),
            teacherId: isValidValueWithDefault(calendar?.teacherId, ""),
            teacher: isValidValueWithDefault(calendar?.teacher, undefined)
        }
    });

    // Component functions
    const validateForm = async (calendarLike: Partial<Calendar>) => {
        debugger;
        // TODO
        
        const isValid = await trigger();

        if (!isValid) {
            return;
        }

        // Validaciones adicionales de negocio
        if (calendarLike.startTime! >= calendarLike.endTime!) {
            setError("endTime", {
                type: "manual",
                message: "La hora de término debe ser mayor que la hora de inicio.",
            });
            return;
        }

        onSubmit(calendarLike);
    }

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
                        <Button onClick={onCancel} data-testid="filter-drawer-close" className="min-w-10 min-h-10 bg-card text-foreground px-0!">
                            <X className="w-5! h-5! text-muted-foreground" />
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
                                    disabled={disabled}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select
                                            disabled={disabled}
                                            value={field.value ?? ""}
                                            onValueChange={(value) => setValue("day", value as DayOfWeekKey)}>
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
                                    disabled={disabled}
                                    render={({ field }) => (
                                        <Input
                                            type="time"
                                            disabled={disabled}
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
                                    disabled={disabled}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Input
                                            type="time"
                                            disabled={disabled}
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
                                    disabled={disabled}
                                    render={({ field }) => (
                                        <Select
                                            disabled={disabled}
                                            value={field.value ?? ""}
                                            onValueChange={(value) => {
                                                setValue("schoolSubject", schoolSubjects.find(item => item.id === value));
                                                setValue("schoolSubjectId", value ?? "")
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
                                    disabled={disabled}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <Select
                                            disabled={disabled}
                                            value={field.value ?? ""}
                                            onValueChange={(value) => {
                                                setValue("teacher", teachers.find(item => item.id === value));
                                                setValue("teacherId", value ?? "");
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
                                                                {`${item.name ?? ""} ${item.firstLastName ?? ""} ${item.secondLastName ?? ""}`}
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
                        {
                            !disabled && (
                                <Button type="submit" aria-label="save-record" onClick={handleSubmit(validateForm)}>
                                    Guardar
                                </Button>
                            )
                        }
                    </section>
                </aside>
            </section>
        </>
    )
}
