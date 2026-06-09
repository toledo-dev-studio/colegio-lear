import { Navigate } from "react-router";
import { Controller } from "react-hook-form";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import ScheduleCalendar from "@/shared/components/schedule-calendar/ScheduleCalendar";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useAcademicCycleSchoolGroupsTab } from "./hooks/useAcademicCycleSchoolGroupsTab";
import { useAcademicCycleSchoolGroupsForm } from "./hooks/useAcademicCycleSchoolGroupsForm";
import { useAcademicCycleSchoolGroupsTable } from "./hooks/useAcademicCycleSchoolGroupsTable";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/shared/ui/select";
import type { AcademicCycleGroupSchoolSubjectCalendar } from "@/interfaces/entites/academic-cycle-group-school-subject-calendar";
import { ACADEMIC_CYCLE_SCHOOL_GROUP_STATUSES, type AcademicCycleSchoolGroup } from "@/interfaces/entites/academic-cycle-school-group";

export const AcademicCycleSchoolGroupsTab = () => {

    // Context hooks and stores configuration
    const { context, loader, queries, mutations, deleteModal } = useAcademicCycleSchoolGroupsTab();

    // Form hook configuration
    const { watcher, control, errors, handleSubmit, reset } = useAcademicCycleSchoolGroupsForm();
    const resetForm = (academicCycleSchoolGroup: AcademicCycleSchoolGroup | undefined = undefined) => {
        reset({
            id: academicCycleSchoolGroup?.id ?? undefined,
            name: academicCycleSchoolGroup?.name ?? "",
            status: academicCycleSchoolGroup?.status ?? undefined,
            description: academicCycleSchoolGroup?.description ?? undefined,
            dischargedDescription: academicCycleSchoolGroup?.dischargedDescription ?? undefined,
            calendars: academicCycleSchoolGroup?.calendars ?? [],
            academicCycleId: context.academicCycleId,
        });
    };

    // Table hook configuration
    const { columns, properties, actions } = useAcademicCycleSchoolGroupsTable(resetForm, deleteModal.open);

    // Component functions
    const handleClickConfirmDeleteSchoolGroup = async () => {
        if (!deleteModal.record)
            return;
        await mutations.deleteSchoolGroupByIdForAcademicCycle.mutateAsync({ academicCycleId: context.academicCycleId, academicCycleSchoolGroupId: deleteModal.record.id },
            {
                onSuccess: () => {
                    toast.success("El grupo escolar se eliminó correctamente del ciclo escolar", { position: "top-right" });
                    deleteModal.close();
                    resetForm(undefined);
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error("Ocurrio un error al tratar de eliminar el ciclo escolar", { position: "top-right" });
                }
            }
        )
    }

    const onSubmit = async (academicCycleSchoolGroupLike: Partial<AcademicCycleSchoolGroup>) => {
        try {
            loader.show("Guardando");
            await mutations.createUpdateSchoolGroupForAcademicCycle.mutateAsync({ academicCycleSchoolGroupLike }, {
                onSuccess: () => {
                    toast.success("Grupo escolar agregado al ciclo escolar correctamente", { position: "top-right" });
                    loader.hide();
                    resetForm(undefined);
                }
            });
        } catch (error) {
            console.warn(error);
            loader.hide();
            toast.error("Ocurrió un error al tratar de registrar el grupo escolar", { position: "top-right" });
        }
    }

    if (queries.schoolGroupsForAcademicCycleQuery.isError) {
        toast.error("No fue posible obtener información de los grupos escolares de este ciclo escolar", { position: "top-right" });
        return <Navigate to="/academic-cycles" />;
    }

    if (queries.schoolGroupsForAcademicCycleQuery.isLoading) {
        return (
            <>
                <div className="w-full relative mx-auto h-full my-4">
                    <CustomFullScreenLoading className="relative" title="Cargando grupos escolares" subtitle="Por favor espere..." />
                </div>
            </>
        );
    }

    return (
        <>
            {/* Create & update school group form */}
            {
                !context.isLocked && (
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-8">
                        <section className="flex flex-col gap-y-6 mt-2 border-b border-border pb-8">
                            <div className="flex flex-col items-start gap-y-3 justify-center border-b border-border pb-4">
                                <h2 className="w-full text-muted-foreground">
                                    REGISTRO DE GRUPOS ESCOLARES
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    En esta sección podrás configurar aquellos grupos escolares que estarán disponibles para los alumnos al momento de su incripción en el ciclo escolar.
                                </p>
                            </div>
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
                                                type="text"
                                                placeholder="Nombre del grupo escolar"
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
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
                                                placeholder="-"
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>
                                {
                                    watcher.isDischargedGroup && (
                                        <div className="control-container">
                                            <label className="label">Razón de baja de grupo <span className="required">*</span>:</label>
                                            <Controller
                                                name="dischargedDescription"
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                    <Textarea
                                                        placeholder="-"
                                                        value={field.value ?? ""}
                                                        onChange={field.onChange}
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

                            <div className="flex flex-col items-start gap-y-3 justify-center border-b border-border pb-4">
                                <h2 className="w-full text-muted-foreground">
                                    ASIGNACIÓN DE HORARIO ESCOLAR
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Configura y edita el horario escolar del grupo seleccionado para este ciclo escolar.
                                </p>
                            </div>

                            {/* Schedule calendar for school group */}
                            <section className="flex flex-col gap-y-6">
                                <Controller
                                    name="calendars"
                                    control={control}
                                    render={({ field }) => (
                                        <ScheduleCalendar
                                            teachers={context.teachers}
                                            calendars={field.value ?? []}
                                            schoolSubjects={context.schoolSubjects ?? []}
                                            onChangeCalendars={(calendars: AcademicCycleGroupSchoolSubjectCalendar[]) => { field.onChange(calendars) }} />
                                    )}
                                />
                            </section>

                            {/* Actions section */}
                            <div className="w-full flex justify-end items-center col-span-1 md:col-span-2 xl:col-span-3 mt-4">
                                <Button type="submit">
                                    {watcher.isNewRecord ? "Agregar nuevo grupo" : "Actualizar grupo"}
                                    <Save className="ml-4 w-4 h-4" />
                                </Button>
                            </div>
                        </section>
                    </form>
                )
            }

            {/* School groups table section */}
            <section className="flex flex-col gap-y-6">
                <div className="flex flex-col items-start gap-y-3 justify-center border-b border-border pb-4">
                    <h2 className="w-full text-muted-foreground">
                        LISTADO DE GRUPOS ESCOLARES PARA EL CICLO ESCOLAR
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        El siguiente listado contiene la información de los grupos escolares que estarán disponibles para los alumnos que sean inscritos a este ciclo escolar.
                    </p>
                </div>

                {/* School groups table */}
                <Table
                    data={queries.schoolGroupsForAcademicCycleQuery.data}
                    isLoading={queries.schoolGroupsForAcademicCycleQuery.isFetching}
                    enablePagination={false}
                    columns={columns}
                    properties={properties}
                    actions={actions}
                />
            </section>

            {/* Delete single record modal */}
            {
                deleteModal.record && (
                    <Modal
                        open={deleteModal.isOpen}
                        type="delete"
                        title={`¿Estas seguro de eliminar el registro ${deleteModal.record.name}`}
                        message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                        isLoading={mutations.deleteSchoolGroupByIdForAcademicCycle.isPending}
                        cancelButton={{
                            label: "Cancelar",
                            onClick: () => deleteModal.close()
                        }}
                        confirmButton={{
                            label: "Sí, eliminar",
                            onClick: handleClickConfirmDeleteSchoolGroup
                        }}
                    />
                )
            }
        </>
    )
}
