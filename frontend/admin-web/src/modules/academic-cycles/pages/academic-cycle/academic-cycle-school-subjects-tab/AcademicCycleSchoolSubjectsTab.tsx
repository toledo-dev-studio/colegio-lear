import { useState } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";

import { Modal } from "@/shared/components/modal/Modal";
import { Table } from "@/shared/components/table/Table";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { TabSectionTitle } from "@/shared/components/tab-section-title/TabSectionTitle";
import { AcademicCycleSchoolSubjectForm } from "./components/AcademicCycleSchoolSubjectForm";
import { useAcademicCycleSchoolSubjectsTab } from "./hooks/useAcademicCycleSchoolSubjectsTab";
import { useAcademicCycleSchoolSubjectsTable } from "./hooks/useAcademicCycleSchoolSubjectsTable";
import type { AcademicCycleSchoolSubject } from "@/interfaces/entites/academic-cycle-school-subject";

export const AcademicCycleSchoolSubjectsTab = () => {
    // Context hooks and stores configuration
    const { context, loader, queries, mutations, deleteModal } = useAcademicCycleSchoolSubjectsTab();

    // Componet hooks and stores
    const [academicCycleSchoolSubject, setAcademicCycleSchoolSubject] = useState<Partial<AcademicCycleSchoolSubject | undefined>>({});

    // Table hook configuration
    const { columns, properties, actions } = useAcademicCycleSchoolSubjectsTable(setAcademicCycleSchoolSubject, deleteModal.open);

    // Component functions
    const handleClickConfirmDeleteSchoolSubject = async () => {
        if (!deleteModal.record)
            return;
        await mutations.schoolSubject.delete.mutateAsync({ academicCycleId: context.academicCycleId!, academicCycleSchoolSubjectId: deleteModal.record.id },
            {
                onSuccess: () => {
                    toast.success("La materia se desasocio correctamente del ciclo escolar", { position: "top-right" });
                    deleteModal.close();
                    setAcademicCycleSchoolSubject({});
                    window.scrollTo(0, 0);
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
            if (!academicCycleSchoolSubjectLike?.id && queries.schoolSubject.data.some(item => item.schoolSubjectId === academicCycleSchoolSubjectLike.schoolSubjectId)) {
                toast.warning("La materia seleccionada ya se encuentra asociada al ciclo escolar", { position: "top-right" });
                return;
            }

            loader.show("Guardando");
            await mutations.schoolSubject.createUpdate.mutateAsync({ academicCycleSchoolSubjectLike }, {
                onSuccess: () => {
                    toast.success("Materia escolar agregada al ciclo escolar correctamente", { position: "top-right" });
                    loader.hide();
                    setAcademicCycleSchoolSubject({});
                    window.scrollTo(0, 0);
                }
            });
        } catch (error) {
            console.warn(error);
            loader.hide();
            toast.error("Ocurrió un error al tratar de asociar la maetria al ciclo escolar", { position: "top-right" });
        }
    }

    if (queries.schoolSubject.isError) {
        toast.error("No fue posible obtener información de las materias asociadas al ciclo escolar", { position: "top-right" });
        return <Navigate to="/academic-cycles" />;
    }

    if (queries.schoolSubject.isLoading) {
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
            {/* School subjects table section */}
            <section className="flex flex-col gap-y-6">
                <TabSectionTitle
                    title="LISTADO DE MATERIAS ASIGNADAS PARA EL CICLO ESCOLAR"
                    description="El siguiente listado contiene la información de las materias que serán impartidas para los alumnos que sean inscritos a este ciclo escolar." />

                {/* School subjects table */}
                <Table
                    data={queries.schoolSubject.data}
                    isLoading={queries.schoolSubject.isLoading}
                    enablePagination={false}
                    columns={columns}
                    properties={properties}
                    actions={actions}
                />
            </section>

            {/* Create & update school subject relation form */}
            {
                !context.isLocked && (
                    <AcademicCycleSchoolSubjectForm
                        academicCycleSchoolSubject={academicCycleSchoolSubject}
                        setAcademicCycleSchoolSubject={setAcademicCycleSchoolSubject}
                        onSubmit={onSubmit}
                    />
                )
            }

            {/* Delete single record modal */}
            {
                deleteModal.record && (
                    <Modal
                        open={deleteModal.isOpen}
                        type="delete"
                        title={`¿Estas seguro de eliminar el registro ${deleteModal.record.schoolSubject?.name}`}
                        message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                        isLoading={mutations.schoolSubject.delete.isPending}
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
