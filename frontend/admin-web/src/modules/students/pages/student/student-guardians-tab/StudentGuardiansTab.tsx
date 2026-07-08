import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { useStudentGuardiansTab } from "./hooks/useStudentGuardiansTab";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import { useStudentGuardiansTabTable } from "./hooks/useStudentGuardiansTabTable";
import { StudentGuardianSidePanelForm } from "./components/StudentGuardianSidePanelForm";
import type { StudentGuardianRequest } from "@/interfaces/requests/student-guardian.request";
import type { StudentGuardianResponse } from "@/interfaces/responses/student-guardian.response";

export const StudentGuardiansTab = () => {
    // Context hooks & stores configuration
    const { context, queries, mutations, studentGuardianSidePanel, deleteModal, loader } = useStudentGuardiansTab();

    // Componet hooks and stores
    const [searchQuery, setSearchQuery] = useState("");

    // Table hook configuration
    const { columns, properties, actions } = useStudentGuardiansTabTable({
        handleClickEdit: (item: StudentGuardianResponse) => studentGuardianSidePanel.open(item),
        handleClickDelete: deleteModal.open
    });

    // Filtering data using memo
    const guardians = useMemo(() => {
        const data = queries.guardians.get.data;

        if (!searchQuery.trim())
            return data;

        const query = searchQuery.toLowerCase();

        return data.filter(item =>
            item.fullName?.toLowerCase().includes(query)
        );
    }, [queries.guardians.get.data, searchQuery]);

    // Component functions
    const handleClickConfirmDeleteStudentGuardian = async () => {
        if (!deleteModal.record)
            return;
        await mutations.guardians.delete.mutateAsync({ id: deleteModal.record.id, studentId: context.studentId! },
            {
                onSuccess: () => {
                    toast.success("Tutor eliminada correctamente", { position: "top-right" });
                    deleteModal.close();
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error("Ocurrio un error al tratar de eliminar el tutor seleccionada", { position: "top-right" });
                }
            }
        )
    }

    const onSubmit = async (studentGuardianRequestLike: Partial<StudentGuardianRequest>) => {
        try {
            loader.show("Guardando");
            await mutations.guardians.createUpdate.mutateAsync({
                id: studentGuardianSidePanel.data?.id || "new",
                studentId: context.studentId!,
                studentGuardianRequestLike
            }, {
                onSuccess: () => {
                    toast.success("Tutor registrado correctamente", { position: "top-right" });
                    loader.hide();
                    studentGuardianSidePanel.close();
                }
            });
        } catch (error) {
            console.warn(error);
            loader.hide();
            toast.error("Ocurrió un error al tratar de guardar el registro", { position: "top-right" });
        }
    }

    if (queries.guardians.get.isError) {
        toast.error("No fue posible obtener información de los tutores del estudiante", { position: "top-right" });
    }

    return (
        <>
            {/* Allergies table section */}
            <section className="flex flex-col gap-y-6">
                <SectionTitle
                    title="LISTADO DE TUTORES REGISTRADOS"
                    description="El siguiente listado contiene la información de los tutores registrados para este alumno." />

                <TableRibbon
                    className="mb-0"
                    filterButton={{ show: false }}
                    exportButton={{ show: false }}
                    addButton={{
                        show: true,
                        label: "Registrar tutor",
                        disabled: queries.guardians.get.isLoading || queries.guardians.get.isError,
                        handleClick: () => studentGuardianSidePanel.open({})
                    }}
                    searchInput={{
                        show: true,
                        disabled: queries.guardians.get.isLoading || queries.guardians.get.isError,
                        placeholder: "Búsqueda general por nombre completo",
                        tooltip: "Búsqueda general por nombre completo",
                        onKeyDown: () => { },
                        onChange: (event) => setSearchQuery(event.target.value || ""),
                        onClickClear: () => setSearchQuery("")
                    }}
                />
                <Table
                    data={guardians}
                    isLoading={queries.guardians.get.isLoading}
                    enablePagination={false}
                    columns={columns}
                    properties={properties}
                    actions={actions}
                />
            </section>

            {/* Create & update allergy form */}
            {
                (studentGuardianSidePanel.isOpen && studentGuardianSidePanel.data) && (
                    <StudentGuardianSidePanelForm
                        studentGuardianResponse={studentGuardianSidePanel.data}
                        handleClickClose={studentGuardianSidePanel.close}
                        onSubmit={onSubmit}
                    />
                )
            }

            {/* Delete single record modal */}
            {
                (deleteModal.isOpen && deleteModal.record) && (
                    <Modal
                        open={deleteModal.isOpen}
                        type="delete"
                        title={`¿Estas seguro de eliminar el registro ${deleteModal.record.fullName}?`}
                        message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                        isLoading={mutations.guardians.delete.isPending}
                        cancelButton={{
                            label: "Cancelar",
                            onClick: () => deleteModal.close()
                        }}
                        confirmButton={{
                            label: "Sí, eliminar",
                            onClick: handleClickConfirmDeleteStudentGuardian
                        }}
                    />
                )
            }
        </>
    )
}
