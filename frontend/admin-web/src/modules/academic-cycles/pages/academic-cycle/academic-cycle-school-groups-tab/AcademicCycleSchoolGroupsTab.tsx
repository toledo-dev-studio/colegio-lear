import { useState } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import ScheduleCalendar from "@/shared/components/schedule-calendar/ScheduleCalendar";
import { TabSectionTitle } from "@/shared/components/tab-section-title/TabSectionTitle";
import { AcademicCycleSchoolGroupForm } from "./components/AcademicCycleSchoolGroupForm";
import { useAcademicCycleSchoolGroupsTab } from "./hooks/useAcademicCycleSchoolGroupsTab";
import { useAcademicCycleSchoolGroupsTable } from "./hooks/useAcademicCycleSchoolGroupsTable";
import { type AcademicCycleSchoolGroup } from "@/interfaces/entites/academic-cycle-school-group";

export const AcademicCycleSchoolGroupsTab = () => {
    // Context hooks & stores configuration
    const { context, loader, queries, mutations, deleteModal } = useAcademicCycleSchoolGroupsTab();

    // Componet hooks and stores
    const [academicCycleSchoolGroup, setAcademicCycleSchoolGroup] = useState<Partial<AcademicCycleSchoolGroup | undefined>>({});

    // Table hook configuration
    const { columns, properties, actions } = useAcademicCycleSchoolGroupsTable(setAcademicCycleSchoolGroup, deleteModal.open);

    // Component functions
    const handleClickConfirmDeleteSchoolGroup = async () => {
        if (!deleteModal.record)
            return;
        await mutations.schoolGroups.delete.mutateAsync({ academicCycleId: context.academicCycleId, academicCycleSchoolGroupId: deleteModal.record.id },
            {
                onSuccess: () => {
                    toast.success("El grupo escolar se eliminó correctamente del ciclo escolar", { position: "top-right" });
                    deleteModal.close();
                    setAcademicCycleSchoolGroup({});
                    window.scrollTo(0, 0);
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
            await mutations.schoolGroups.createUpdate.mutateAsync({ academicCycleSchoolGroupLike }, {
                onSuccess: () => {
                    toast.success("Grupo escolar agregado al ciclo escolar correctamente", { position: "top-right" });
                    loader.hide();
                    setAcademicCycleSchoolGroup({});
                    window.scrollTo(0, 0);
                }
            });
        } catch (error) {
            console.warn(error);
            loader.hide();
            toast.error("Ocurrió un error al tratar de registrar el grupo escolar", { position: "top-right" });
        }
    }

    if (queries.schoolGroups.isError) {
        toast.error("No fue posible obtener información de los grupos escolares de este ciclo escolar", { position: "top-right" });
        return <Navigate to="/academic-cycles" />;
    }

    if (queries.schoolGroups.isLoading) {
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
            {/* School groups table section */}
            <section className="flex flex-col gap-y-6">
                <TabSectionTitle
                    title="LISTADO DE GRUPOS ESCOLARES PARA EL CICLO ESCOLAR"
                    description="El siguiente listado contiene la información de los grupos escolares que estarán disponibles para los alumnos que sean inscritos a este ciclo escolar." />
                <Table
                    data={queries.schoolGroups.data}
                    isLoading={queries.schoolGroups.isLoading}
                    enablePagination={false}
                    columns={columns}
                    properties={properties}
                    actions={actions}
                />
            </section>

            {/* Create & update school group form */}
            {
                (!context.isLocked) && (
                    <AcademicCycleSchoolGroupForm
                        teachers={queries.teachers.data}
                        schoolSubjects={queries.schoolSubjects.data}
                        academicCycleSchoolGroup={academicCycleSchoolGroup}
                        setAcademicCycleSchoolGroup={setAcademicCycleSchoolGroup}
                        onSubmit={onSubmit}
                    />
                )
            }

            {/* Calendar view when record is locked */}
            {
                context.isLocked && (
                    <>
                        <TabSectionTitle
                            title="DETALLE DE HORARIO ESCOLAR"
                            description="Selecciona un grupo escolar para poder consultar el horario configurado" />
                        {
                            academicCycleSchoolGroup && (
                                <ScheduleCalendar
                                    disabled={true}
                                    teachers={[]}
                                    schoolSubjects={[]}
                                    calendars={academicCycleSchoolGroup?.calendars ?? []} />
                            )
                        }
                    </>
                )
            }

            {/* Delete single record modal */}
            {
                (!context.isLocked && deleteModal.record) && (
                    <Modal
                        open={deleteModal.isOpen}
                        type="delete"
                        title={`¿Estas seguro de eliminar el registro ${deleteModal.record.name}`}
                        message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                        isLoading={mutations.schoolGroups.delete.isPending}
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
