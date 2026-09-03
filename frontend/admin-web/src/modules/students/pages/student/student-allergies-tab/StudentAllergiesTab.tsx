import { useMemo, useState } from "react";
import { toast } from "sonner";
import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { useStudentAllergiesTab } from "./hooks/useStudentAllergiesTab";
import { AllergySidePanelForm } from "./components/AllergySidePanelForm";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import type { AllergyRequest } from "@/interfaces/requests/allergy.request";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import type { AllergyResponse } from "@/interfaces/responses/allergy.response";
import { useStudentAllergiesTabTable } from "./hooks/useStudentAllergiesTabTable";

export const StudentAllergiesTab = () => {
    // Context hooks & stores configuration
    const { context, queries, mutations, allergySidePanel, deleteModal, loader } = useStudentAllergiesTab();

    // Componet hooks and stores
    const [searchQuery, setSearchQuery] = useState("");

    // Table hook configuration
    const { columns, properties, actions } = useStudentAllergiesTabTable({
        handleClickEdit: (item: AllergyResponse) => allergySidePanel.open(item),
        handleClickDelete: deleteModal.open
    });

    // Filtering data using memo
    const allergies = useMemo(() => {
        const data = queries.allergies.get.data;

        if (!searchQuery.trim())
            return data;

        const query = searchQuery.toLowerCase();

        return data.filter(item =>
            item.name?.toLowerCase().includes(query)
        );
    }, [queries.allergies.get.data, searchQuery]);

    // Component functions
    const handleClickConfirmDeleteAllergy = async () => {
        if (!deleteModal.record)
            return;
        await mutations.allergies.delete.mutateAsync({ id: deleteModal.record.id, studentId: context.studentId! },
            {
                onSuccess: () => {
                    toast.success("Alergía eliminada correctamente", { position: "top-right" });
                    deleteModal.close();
                },
                onError: (error) => {
                    console.warn(error);
                    showApiErrorToast(error, "Ocurrio un error al tratar de eliminar la alergía seleccionada");
                }
            }
        )
    }

    const onSubmit = async (allergyRequestLike: Partial<AllergyRequest>) => {
        try {
            loader.show("Guardando");
            await mutations.allergies.createUpdate.mutateAsync({
                id: allergySidePanel.data?.id || "new",
                studentId: context.studentId!,
                allergyRequestLike
            }, {
                onSuccess: () => {
                    toast.success("Alergía registrada correctamente", { position: "top-right" });
                    loader.hide();
                    allergySidePanel.close();
                }
            });
        } catch (error) {
            console.warn(error);
            loader.hide();
            showApiErrorToast(error, "Ocurrió un error al tratar de guardar el registro");
        }
    }

    if (queries.allergies.get.isError) {
        showApiErrorToast(queries.allergies.get.error, "No fue posible obtener información de las alergias del estudiante");
    }

    return (
        <>
            {/* Allergies table section */}
            <section className="flex flex-col gap-y-6">
                <SectionTitle
                    title="LISTADO DE ALERGIAS"
                    description="El siguiente listado contiene la información de las alergias registradas para este alumno." />

                <TableRibbon
                    className="mb-0"
                    filterButton={{ show: false }}
                    exportButton={{ show: false }}
                    addButton={{
                        show: context.loggedInUserCanWrite,
                        label: "Registrar alergía",
                        disabled: queries.allergies.get.isLoading || queries.allergies.get.isError,
                        handleClick: () => allergySidePanel.open({})
                    }}
                    searchInput={{
                        show: true,
                        disabled: queries.allergies.get.isLoading || queries.allergies.get.isError,
                        placeholder: "Búsqueda general por nombre",
                        tooltip: "Búsqueda general por nombre",
                        onKeyDown: () => { },
                        onChange: (event) => setSearchQuery(event.target.value || ""),
                        onClickClear: () => setSearchQuery("")
                    }}
                />
                <Table
                    data={allergies}
                    isLoading={queries.allergies.get.isLoading}
                    enablePagination={false}
                    columns={columns}
                    properties={properties}
                    actions={actions}
                />
            </section>

            {/* Create & update allergy form */}
            {
                (allergySidePanel.isOpen && allergySidePanel.data) && (
                    <AllergySidePanelForm
                        allergyResponse={allergySidePanel.data}
                        handleClickClose={allergySidePanel.close}
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
                        title={`¿Estas seguro de eliminar el registro ${deleteModal.record.name}?`}
                        message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                        isLoading={mutations.allergies.delete.isPending}
                        cancelButton={{
                            label: "Cancelar",
                            onClick: () => deleteModal.close()
                        }}
                        confirmButton={{
                            label: "Sí, eliminar",
                            onClick: handleClickConfirmDeleteAllergy
                        }}
                    />
                )
            }
        </>
    )
}
