import { Link, useOutletContext } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";
import ScheduleCalendar from "@/shared/components/schedule-calendar/ScheduleCalendar";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";
import { ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { AcademicCycleSchoolGroupRequest } from "@/interfaces/requests/academic-cycle-school-group.request";
import type { AcademicCycleSchoolGroupResponse } from "@/interfaces/responses/academic-cycle-school-group.response";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";

interface Props {
    isSubmitting: boolean;
    teachersResponse: EmployeeResponse[];
    schoolSubjectsResponse: SchoolSubjectResponse[];
    academicCycleSchoolGroupResponse?: AcademicCycleSchoolGroupResponse;
    onSubmit: (academicCycleSchoolGroupRequestLike: Partial<AcademicCycleSchoolGroupRequest>) => void;
}

export const AcademicCycleSchoolGroupForm = ({ isSubmitting, teachersResponse, schoolSubjectsResponse, academicCycleSchoolGroupResponse, onSubmit }: Props) => {
    // Get context from layout
    const { academicCycleId } = useOutletContext<AcademicCycleLayoutContext>();

    // Use react hook form configuration
    const { control, handleSubmit, formState: { errors }, watch } = useForm<Partial<AcademicCycleSchoolGroupRequest>>({
        defaultValues: {
            academicCycleId: academicCycleId,
            name: isValidValueWithDefault(academicCycleSchoolGroupResponse?.name, ""),
            status: isValidValueWithDefault(academicCycleSchoolGroupResponse?.status, undefined),
            description: isValidValueWithDefault(academicCycleSchoolGroupResponse?.description, ""),
            dischargedDescription: isValidValueWithDefault(academicCycleSchoolGroupResponse?.dischargedDescription, ""),
            calendars: isValidValueWithDefault(academicCycleSchoolGroupResponse?.calendars, []),
        }
    });
    const isDischarged = watch("status") === "discharged";

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-8">
                <section className="flex flex-col gap-y-6">
                    <SectionTitle
                        title="INFORMACIÓN GENERAL DEL GRUPO ESCOLAR"
                        description="Consulta & edita la configuración general del grupo escolar, tales como su nombre, estatus y descripción." />

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
                                                {!field.value ? "Selecciona una opción" : labelOf(ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES, field.value ?? "")}
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
                                    teachers={teachersResponse}
                                    calendars={field.value || []}
                                    schoolSubjects={schoolSubjectsResponse}
                                    onChangeCalendars={(calendars) => field.onChange(calendars)} />
                            )}
                        />
                    </section>
                </section>

                {/* Actions Buttons */}
                <section className="flex items-center justify-end mt-8 gap-x-4 border-t border-border pt-8">
                    <Link to={`/academic-cycles/${academicCycleId}/school-groups`}>
                        <Button type="button" disabled={isSubmitting} aria-label="cancel" variant={"ghost"}>
                            Cancelar
                        </Button>
                    </Link>
                    <Button type="submit" disabled={isSubmitting} aria-label="save-record">
                        Guardar
                    </Button>
                </section>

            </form>
        </>
    )
}
