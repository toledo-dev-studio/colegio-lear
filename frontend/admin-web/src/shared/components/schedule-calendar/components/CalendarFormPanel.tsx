import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import type { Calendar } from "../types/calendar";
import { SidePanel } from "../../side-panel/SidePanel";
import { SLOT_MIN } from "../lib/schedule-calendar-consts";
import { generateTemporalId } from "@/lib/extensions/utils";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { DAY_OF_WEEKS } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import { type DayOfWeekKey } from "@/lib/key-value-pairs/key-value-pair-types";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";

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
    const { control, formState: { errors }, trigger, setError, handleSubmit, setValue } = useForm<Partial<Calendar>>({
        defaultValues: {
            id: isValidValueWithDefault(calendar?.id, generateTemporalId()),
            day: isValidValueWithDefault(calendar?.day, undefined),
            startTime: isValidValueWithDefault(calendar?.startTime, ""),
            endTime: isValidValueWithDefault(calendar?.endTime, ""),
            academicCycleId: isValidValueWithDefault(calendar?.academicCycleId, ""),
            academicCycleSchoolGroupId: isValidValueWithDefault(calendar?.academicCycleSchoolGroupId, ""),
            schoolSubjectId: isValidValueWithDefault(calendar?.schoolSubjectId, ""),
            schoolSubject: isValidValueWithDefault(calendar?.schoolSubject, undefined),
            teacherId: isValidValueWithDefault(calendar?.teacherId, ""),
            teacher: isValidValueWithDefault(calendar?.teacher, undefined)
        }
    });

    // Component functions
    const validateForm = async (calendarLike: Partial<Calendar>) => {
        if (disabled) {
            onCancel();
            return;
        }

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

    return (
        <>
            {/* Schedule calendar form */}
            <SidePanel
                title="ASOCIACIÓN DE HORARIO"
                handleClickClose={onCancel}
                cancelButton={{ show: true, disabled: false, type: "button", label: "Cancelar", handleClick: onCancel }}
                submitButton={{ show: true, disabled: false, type: "submit", label: "Guardar", handleClick: handleSubmit(validateForm) }}>

                <section className="flex flex-col gap-8">

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
                                    {errors.endTime.message || "La hora de termino de clase es requerido"}
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

                </section>

            </SidePanel>
        </>
    )
}
