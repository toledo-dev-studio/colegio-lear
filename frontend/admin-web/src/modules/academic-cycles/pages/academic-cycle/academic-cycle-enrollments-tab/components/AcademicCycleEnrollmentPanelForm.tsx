import { useOutletContext } from "react-router";
import { Controller, useForm } from "react-hook-form";

import { Textarea } from "@/shared/ui/textarea";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { SidePanel } from "@/shared/components/side-panel/SidePanel";
import { SearchInput } from "@/shared/components/search-input/SearchInput";
import type { StudentResponse } from "@/interfaces/responses/student.response";
import type { ScholarshipResponse } from "@/interfaces/responses/scholarship.response";
import { useSearchStudents } from "@/modules/students/hooks/students/useSearchStudents";
import { useSearchScholarships } from "@/modules/scholarships/hooks/useSearchScholarships";
import { ACADEMIC_CYCLE_ENROLLMENT_STATUSES } from "@/lib/key-value-pairs/key-value-pair-catalogs";
import type { AcademicCycleEnrollmentRequest } from "@/interfaces/requests/academic-cycle-enrollment.request";
import type { AcademicCycleEnrollmentResponse } from "@/interfaces/responses/academic-cycle-enrollment.response";
import type { AcademicCycleSchoolGroupResponse } from "@/interfaces/responses/academic-cycle-school-group.response";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { useState } from "react";

interface Props {
    academicCycleEnrollmentResponse: Partial<AcademicCycleEnrollmentResponse>;
    academicCycleSchoolGroups: AcademicCycleSchoolGroupResponse[];
    handleClickClose: () => void;
    onSubmit: (academicCycleEnrollmentRequestLike: Partial<AcademicCycleEnrollmentRequest>) => void;
}

export const AcademicCycleEnrollmentPanelForm = ({ academicCycleEnrollmentResponse, academicCycleSchoolGroups, onSubmit, handleClickClose }: Props) => {
    // Get context from layout
    const { academicCycleId, isLocked, enrollmentOpen } = useOutletContext<AcademicCycleLayoutContext>();
    const [student, setStudent] = useState<Partial<StudentResponse>>();
    const studentFullName = `${student?.name || ""} ${student?.firstLastName || ""} ${student?.secondLastName || ""}`;

    // Component hooks & stores
    const searchStudentsMutation = useSearchStudents();
    const searchScholarshipsMutation = useSearchScholarships();

    // Use react hook form configuration
    const { control, formState: { errors }, handleSubmit, watch, setValue } = useForm<Partial<AcademicCycleEnrollmentRequest>>({
        defaultValues: {
            academicCycleId: academicCycleId,
            status: isValidValueWithDefault(academicCycleEnrollmentResponse?.status, undefined),
            observations: isValidValueWithDefault(academicCycleEnrollmentResponse?.observations, ""),
            droppedNotes: isValidValueWithDefault(academicCycleEnrollmentResponse?.droppedNotes, ""),
            studentId: isValidValueWithDefault(academicCycleEnrollmentResponse?.studentId, ""),
            academicCycleSchoolGroupId: isValidValueWithDefault(academicCycleEnrollmentResponse?.academicCycleSchoolGroupId, ""),
            scholarshipId: isValidValueWithDefault(academicCycleEnrollmentResponse?.scholarshipId, ""),
            scholarship: isValidValueWithDefault(academicCycleEnrollmentResponse?.scholarship, undefined),
        }
    });


    const scholarship = watch("scholarship");
    const academicCycleSchoolGroupId = watch("academicCycleSchoolGroupId") ?? undefined;
    const isDropped = watch("status") === "dropped";

    return (
        <>
            <SidePanel
                title="REGISTRO DE INSCRIPCIÓN"
                handleClickClose={handleClickClose}
                cancelButton={{ show: true, disabled: false, type: "button", label: "Cancelar", handleClick: handleClickClose }}
                submitButton={{ show: true, disabled: false, type: "submit", label: "Guardar", handleClick: handleSubmit(onSubmit) }}>

                <form className="flex flex-col gap-8">

                    <div className="control-container">
                        <label className="label">Estudiante <span className="required">*</span>:</label>
                        <Controller
                            name="studentId"
                            control={control}
                            disabled={!enrollmentOpen}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <SearchInput
                                    {...field}
                                    name="studentId"
                                    defaultValue={studentFullName.trim()}
                                    selected={!!student}
                                    disabled={!enrollmentOpen}
                                    labelSchemaName="enrollment"
                                    placeholder="Busqueda de estudiante"
                                    options={searchStudentsMutation.students}
                                    isSearching={searchStudentsMutation.isPending}
                                    onClearSelection={() => {
                                        setValue("studentId", undefined);
                                        setStudent(undefined);
                                    }}
                                    onOptionChange={async (option: StudentResponse) => {
                                        setValue("studentId", option.id);
                                        setStudent(option);
                                        searchStudentsMutation.clearSearchResult();
                                    }}
                                    onSearch={async (query) => searchStudentsMutation.searchAsync({ query, isActive: true })}
                                />
                            )}
                        />
                        {
                            (errors.studentId && !student) && (
                                <p className="error">
                                    El estudiante es un valor obligatorio
                                </p>
                            )
                        }
                    </div>

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
                        {
                            (errors.academicCycleSchoolGroupId && !academicCycleSchoolGroupId) && (
                                <p className="error">
                                    El grupo escolar es obligatorio
                                </p>
                            )
                        }
                    </div>

                    <div className="control-container">
                        <label className="label">Estatus de la inscripción <span className="required">*</span>:</label>
                        <Controller
                            control={control}
                            name={"status"}
                            render={({ field }) => (
                                <Select
                                    value={field.value ?? ""}
                                    onValueChange={field.onChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecciona una opción">
                                            {field.value ? labelOf(ACADEMIC_CYCLE_ENROLLMENT_STATUSES, field.value) : "Selecciona una opción"}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Estatus de la inscripción</SelectLabel>
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
                        {
                            (errors.status) && (
                                <p className="error">
                                    El estatus de la inscripción del alumno es requerido
                                </p>
                            )
                        }
                    </div>

                    {
                        !isLocked && (
                            <div className="control-container">
                                <label className="label">Beca asignada:</label>
                                <Controller
                                    name="scholarshipId"
                                    control={control}
                                    render={({ field }) => (
                                        <SearchInput
                                            {...field}
                                            name="scholarshipId"
                                            defaultValue={scholarship?.name}
                                            selected={!!scholarship}
                                            placeholder="Busqueda de estudiante"
                                            options={searchScholarshipsMutation.scholarships}
                                            isSearching={searchScholarshipsMutation.isPending}
                                            onClearSelection={() => {
                                                setValue("scholarshipId", "");
                                                setValue("scholarship", undefined);
                                            }}
                                            onOptionChange={async (option: ScholarshipResponse) => {
                                                setValue("scholarshipId", option.id);
                                                setValue("scholarship", option);
                                                searchScholarshipsMutation.clearSearchResult();
                                            }}
                                            onSearch={async (query) => searchScholarshipsMutation.searchAsync({ query, isActive: true })}
                                        />
                                    )}
                                />
                            </div>
                        )
                    }

                    <div className="control-container">
                        <label className="label">Observaciones:</label>
                        <Controller
                            name="observations"
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="-"
                                />
                            )}
                        />
                    </div>

                    {isDropped && (
                        <div className="control-container">
                            <label className="label">Razón de baja <span className="required">*</span>:</label>
                            <Controller
                                name="droppedNotes"
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
                                errors.droppedNotes && (
                                    <p className="error">
                                        Es necesario agregar una razón de la baja de ciclo escolar
                                    </p>
                                )
                            }
                        </div>
                    )}
                </form>

            </SidePanel>
        </>
    );
}
