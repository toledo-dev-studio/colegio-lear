import { Navigate } from "react-router";
import { Controller } from "react-hook-form";
import { toast } from "sonner";
import { Save } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { Modal } from "@/shared/components/modal/Modal";
import { Table } from "@/shared/components/table/Table";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";
import { CustomSearchInput } from "@/shared/components/CustomSearchInput";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useAcademicCycleSchoolSubjectsTab } from "./hooks/useAcademicCycleSchoolSubjectsTab"
import { useAcademicCycleSchoolSubjectForm } from "./hooks/useAcademicCycleSchoolSubjectForm";
import type { AcademicCycleSchoolSubject } from "@/interfaces/entites/academic-cycle-school-subject";
import { useAcademicCycleSchoolSubjectsTable } from "./hooks/useAcademicCycleSchoolSubjectsTable";

export const AcademicCycleSchoolSubjectsTab = () => {
    // Context hooks and stores configuration
    const { context, loader, queries, mutations, deleteModal } = useAcademicCycleSchoolSubjectsTab();

    // Form hook configuration
    const { watcher, control, errors, handleSubmit, register, setValue, reset } = useAcademicCycleSchoolSubjectForm();

    // Table hook configuration
    const { columns, properties, actions } = useAcademicCycleSchoolSubjectsTable(reset, deleteModal.open);

    // Component functions
    const handleClickConfirmDeleteSchoolSubject = async () => {
        if (!deleteModal.record)
            return;
        await mutations.deleteSchoolSubjectByIdForAcademicCycle.mutateAsync({ academicCycleId: context.academicCycleId, academicCycleSchoolSubjectId: deleteModal.record.id },
            {
                onSuccess: () => {
                    toast.success("La materia se desasocio correctamente del ciclo escolar", { position: "top-right" });
                    deleteModal.close();
                    reset(undefined);
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error("Ocurrio un error al tratar de desasociar la materia del ciclo escolar", { position: "top-right" });
                }
            }
        )
    }

    const onSubmit = async (academicCycleSchoolSubjectLike: Partial<AcademicCycleSchoolSubject>) => {
        try {
            if (queries.schoolSubjectsForAcademicCycleQuery.data.some(item => item.schoolSubjectId === academicCycleSchoolSubjectLike.schoolSubjectId)) {
                toast.warning("La materia seleccionada ya se encuentra asociada al ciclo escolar", { position: "top-right" });
                return;
            }

            loader.show("Guardando");
            await mutations.createUpdateSchoolSubjectForAcademicCycle.mutateAsync({ academicCycleSchoolSubjectLike }, {
                onSuccess: () => {
                    toast.success("Materia escolar agregada al ciclo escolar correctamente", { position: "top-right" });
                    loader.hide();
                    reset(undefined);
                }
            });
        } catch (error) {
            console.warn(error);
            loader.hide();
            toast.error("Ocurrió un error al tratar de asociar la maetria al ciclo escolar", { position: "top-right" });
        }
    }

    if (queries.schoolSubjectsForAcademicCycleQuery.isError) {
        toast.error("No fue posible obtener información de las materias asociadas al ciclo escolar", { position: "top-right" });
        return <Navigate to="/academic-cycles" />;
    }

    if (queries.schoolSubjectsForAcademicCycleQuery.isLoading) {
        return (
            <>
                <div className="w-full relative mx-auto h-full my-4">
                    <CustomFullScreenLoading className="relative" title="Cargando materias del ciclo escolar" subtitle="Por favor espere..." />
                </div>
            </>
        );
    }

    return (
        <>
            {/* Create & update school subject relation form */}
            {
                !context.isLocked && (
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-y-8">
                        <section className="flex flex-col gap-y-6 mt-2 border-b border-border pb-8">
                            <div className="flex flex-col items-start gap-y-3 justify-center border-b border-border pb-4">
                                <h2 className="w-full text-muted-foreground">
                                    ASOCIACIÓN DE MATERIA AL CICLO ESCOLAR
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    En esta sección podrás configurar aquellas materias que deberán cursar los alumnos una vez inscritos a este ciclo escolar.
                                </p>
                            </div>

                            {/* Fields */}
                            <section className="grid grid-cols-1 gap-8">
                                <div className="w-full">
                                    <label className="text-sm font-medium text-foreground mb-2 block">Materia <span className="text-destructive">*</span>:</label>
                                    <CustomSearchInput
                                        {...register("schoolSubjectId", { required: true })}
                                        defaultValue={watcher.schoolSubject?.name}
                                        selected={!!watcher.schoolSubject?.id}
                                        placeholder="Busqueda de materia escolar"
                                        options={mutations.searchSchoolSubjects.schoolSubjects}
                                        isSearching={mutations.searchSchoolSubjects.isPending}
                                        onClearSelection={() => {
                                            setValue("schoolSubjectId", undefined);
                                            setValue("schoolSubject", undefined);
                                        }}
                                        onOptionChange={async (option: SchoolSubject) => {
                                            setValue("schoolSubjectId", option.id);
                                            setValue("schoolSubject", option);
                                            mutations.searchSchoolSubjects.clearSearchResult();
                                        }}
                                        onSearch={async (query) => mutations.searchSchoolSubjects.searchAsync({
                                            query,
                                            status: true,
                                            academicLevelId: context.academicCycle.academicLevelId,
                                            educationLevelId: context.academicCycle.educationLevelId
                                        })}
                                    />
                                    {
                                        (errors.schoolSubjectId && !watcher.schoolSubject?.id) && (
                                            <p className="text-red-500 text-sm mt-2">
                                                La materia escolar es obligatoria
                                            </p>
                                        )
                                    }
                                </div>
                                <div className="w-full">
                                    <label className="text-sm font-medium text-foreground mb-2 block">Descripción de la materia:</label>
                                    <Textarea
                                        value={watcher.schoolSubject?.description ?? "-"}
                                        disabled={true}
                                    />
                                </div>
                                <div className="w-full">
                                    <label className="text-sm font-medium text-foreground mb-2 block">Comentarios adicionales:</label>
                                    <Controller
                                        name="observations"
                                        control={control}
                                        render={({ field }) => (
                                            <Textarea
                                                placeholder="-"
                                                value={field.value ?? ""}
                                                onChange={field.onChange}
                                            />
                                        )} />
                                </div>
                            </section>
                            <div className="w-full flex justify-end items-center col-span-1 md:col-span-2 xl:col-span-3 mt-4">
                                <Button type="submit">
                                    {watcher.isNewRecord ? "Agregar nueva materia" : "Actualizar materia"}
                                    <Save className="ml-4 w-4 h-4" />
                                </Button>
                            </div>
                        </section>
                    </form>
                )
            }

            {/* School subjects table section */}
            <section className="flex flex-col gap-y-6">
                <div className="flex flex-col items-start gap-y-3 justify-center border-b border-border pb-4">
                    <h2 className="w-full text-muted-foreground">
                        LISTADO DE MATERIAS ASIGNADAS PARA EL CICLO ESCOLAR
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        El siguiente listado contiene la información de las materias que serán impartidas para los alumnos que sean inscritos a este ciclo escolar.
                    </p>
                </div>

                {/* School subjects table */}
                <Table
                    data={queries.schoolSubjectsForAcademicCycleQuery.data}
                    isLoading={queries.schoolSubjectsForAcademicCycleQuery.isFetching}
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
                        title={`¿Estas seguro de eliminar el registro ${deleteModal.record.schoolSubject?.name}`}
                        message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                        isLoading={mutations.deleteSchoolSubjectByIdForAcademicCycle.isPending}
                        cancelButton={{
                            label: "Cancelar",
                            onClick: () => deleteModal.close()
                        }}
                        confirmButton={{
                            label: "Sí, eliminar",
                            onClick: handleClickConfirmDeleteSchoolSubject
                        }}
                    />
                )
            }
        </>
    )
}
