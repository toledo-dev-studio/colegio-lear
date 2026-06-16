import { useEffect, useRef } from "react";
import { useOutletContext } from "react-router";
import { Controller, useForm } from "react-hook-form";
import { X } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import type { Student } from "@/interfaces/entites/student";
import type { Scholarship } from "@/interfaces/entites/scholarship";
import { isValidValueWithDefault } from "@/lib/extensions/datatypes";
import { SearchInput } from "@/shared/components/search-input/SearchInput";
import { useSearchStudents } from "@/modules/students/hooks/students/useSearchStudents";
import { useSearchScholarships } from "@/modules/scholarships/hooks/useSearchScholarships";
import type { AcademicCycleSchoolGroup } from "@/interfaces/entites/academic-cycle-school-group";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { ACADEMIC_CYCLE_SCHOOL_GROUP_ENROLLMENT_STATUSES, type AcademicCycleSchoolGroupEnrollment } from "@/interfaces/entites/academic-cycle-school-group-enrollment";

interface Props {
    open: boolean;
    title?: string;
    academicCycleSchoolGroups: AcademicCycleSchoolGroup[];
    academicCycleSchoolGroupEnrollment?: Partial<AcademicCycleSchoolGroupEnrollment>,
    handleClickClose: () => void;
    onSubmit: (enrollmentLike: Partial<AcademicCycleSchoolGroupEnrollment>) => void;
}

export const AcademicCycleEnrollmentPanelForm = ({ open, title, academicCycleSchoolGroups, academicCycleSchoolGroupEnrollment, onSubmit, handleClickClose }: Props) => {
    // Get context from layout
    const { academicCycleId } = useOutletContext<AcademicCycleLayoutContext>();

    // Component hooks and stores
    const searchStudentsMutation = useSearchStudents();
    const studentSearchInputRef = useRef<HTMLInputElement>(null);

    const searchScholarshipsMutation = useSearchScholarships();
    const scholarshipSearchInputRef = useRef<HTMLInputElement>(null);

    // Use react hook form configuration
    const { control, formState: { errors }, handleSubmit, watch, setValue, reset } = useForm<Partial<AcademicCycleSchoolGroupEnrollment>>({
        defaultValues: {
            id: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.id, undefined),
            status: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.status, "enrolled"),
            observations: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.observations, ""),
            droppedNotes: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.droppedNotes, ""),
            studentId: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.studentId, ""),
            student: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.student, undefined),
            academicCycleSchoolGroupId: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.academicCycleSchoolGroupId, ""),
            academicCycleSchoolGroup: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.academicCycleSchoolGroup, undefined),
            scholarshipId: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.scholarshipId, ""),
            scholarship: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.scholarship, undefined),
            academicCycleId: academicCycleId,
        }
    });

    const isNewRecord = watch("id") === undefined;
    const student = watch("student");
    const scholarship = watch("scholarship");
    const academicCycleSchoolGroupId = watch("academicCycleSchoolGroupId") ?? undefined;
    const isDropped = watch("status") === "dropped";

    useEffect(() => {
        requestAnimationFrame(() => {
            reset({
                id: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.id, undefined),
                status: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.status, "enrolled"),
                observations: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.observations, ""),
                droppedNotes: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.droppedNotes, ""),
                studentId: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.studentId, undefined),
                student: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.student, undefined),
                academicCycleSchoolGroupId: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.academicCycleSchoolGroupId, undefined),
                academicCycleSchoolGroup: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.academicCycleSchoolGroup, undefined),
                scholarshipId: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.scholarshipId, undefined),
                scholarship: isValidValueWithDefault(academicCycleSchoolGroupEnrollment?.scholarship, undefined),
                academicCycleId: academicCycleId,
            });
        });
    }, [academicCycleSchoolGroupEnrollment]);

    if (!open)
        return null;

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit, () => {
                console.log(errors);
                (errors.studentId && !student?.id) && studentSearchInputRef.current?.focus()
            })} className="fixed inset-0 z-50 flex justify-end">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClickClose} />
                <aside className="relative box-border bg-card w-full max-w-md h-full border-l border-border shadow-2xl flex flex-col animate-slide-in-right">
                    <div className="h-22 flex items-center justify-between px-10 border-b border-border">
                        <h3 className="font-heading text-xl font-bold uppercase">
                            {title}
                        </h3>
                        <Button onClick={handleClickClose} className="min-w-10 min-h-10 bg-card text-foreground !px-0">
                            <X className="!w-5 !h-5 text-muted-foreground" />
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-10 py-10 space-y-5">

                        <div className="flex flex-col gap-8">

                            <div className="control-container">
                                <label className="label">Estudiante <span className="required">*</span>:</label>
                                <Controller
                                    name="studentId"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                        <SearchInput
                                            {...field}
                                            ref={studentSearchInputRef}
                                            name="studentId"
                                            defaultValue={student?.name}
                                            selected={!!student?.id}
                                            placeholder="Busqueda de estudiante"
                                            options={searchStudentsMutation.students}
                                            isSearching={searchStudentsMutation.isPending}
                                            onClearSelection={() => {
                                                setValue("studentId", undefined);
                                                setValue("student", undefined);
                                            }}
                                            onOptionChange={async (option: Student) => {
                                                setValue("studentId", option.id);
                                                setValue("student", option);
                                                searchStudentsMutation.clearSearchResult();
                                            }}
                                            onSearch={async (query) => searchStudentsMutation.searchAsync({
                                                query,
                                                status: true,
                                            })}
                                        />
                                    )}
                                />
                                {
                                    (errors.studentId && !student?.id) && (
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
                                                    {!field.value ? "Selecciona una opción" : ACADEMIC_CYCLE_SCHOOL_GROUP_ENROLLMENT_STATUSES.find(item => item.key === field.value)?.label}
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Estatus de la inscripción</SelectLabel>
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
                                {
                                    (errors.status) && (
                                        <p className="error">
                                            El estatus de la inscripción del alumno es requerido
                                        </p>
                                    )
                                }
                            </div>

                            <div className="control-container">
                                <label className="label">Beca asignada:</label>
                                <Controller
                                    name="scholarshipId"
                                    control={control}
                                    render={({ field }) => (
                                        <SearchInput
                                            {...field}
                                            ref={scholarshipSearchInputRef}
                                            name="scholarshipId"
                                            defaultValue={scholarship?.name}
                                            selected={!!scholarship?.id}
                                            placeholder="Busqueda de estudiante"
                                            options={searchScholarshipsMutation.scholarships}
                                            isSearching={searchScholarshipsMutation.isPending}
                                            onClearSelection={() => {
                                                setValue("scholarshipId", undefined);
                                                setValue("scholarship", undefined);
                                            }}
                                            onOptionChange={async (option: Scholarship) => {
                                                setValue("scholarshipId", option.id);
                                                setValue("scholarship", option);
                                                searchScholarshipsMutation.clearSearchResult();
                                            }}
                                            onSearch={async (query) => searchScholarshipsMutation.searchAsync({
                                                query,
                                                status: true,
                                            })}
                                        />
                                    )}
                                />
                            </div>

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

                        </div>
                    </div>
                    <div className="px-8 py-6 border-t border-border flex items-center justify-between gap-3 box-border">
                        <Button type="button" variant={"ghost"} onClick={handleClickClose}>
                            Cancelar
                        </Button>
                        <Button type="submit" variant={"default"}>
                            {isNewRecord ? "Registrar inscripción" : "Actualizar inscripción"}
                        </Button>
                    </div>
                </aside>
            </form>
        </>
    );
}
