import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import { useAcademicCycleWalletTab } from "./hooks/useAcademicCycleWalletTab";
import { useAcademicCycleWalletTable } from "./hooks/useAcademicCycleWalletTable";
import { AcademicCycleWalletPanelForm } from "./components/AcademicCycleWalletPanelForm";
import type { AcademicCycleWalletItemRequest } from "@/interfaces/requests/academic-cycle-wallet-item.request";
import type { AcademicCycleWalletItemResponse } from "@/interfaces/responses/academic-cycle-wallet-item.response";

export const AcademicCycleWalletTab = () => {
    // Context hooks & stores configuration
    const { context, queries, mutations, deleteModal, loader } = useAcademicCycleWalletTab();

    // Componet hooks and stores
    const [searchQuery, setSearchQuery] = useState("");
    const [isOpenCreateUpdatePanelForm, setIsOpenCreateUpdatePanelForm] = useState<boolean>(false);
    const [academicCycleWalletToEdit, setAcademicCycleWalletToEdit] = useState<Partial<AcademicCycleWalletItemResponse>>();

    // Table hook configuration
    const { columns, properties, actions } = useAcademicCycleWalletTable({
        handleClickEdit: (item: AcademicCycleWalletItemResponse) => {
            setAcademicCycleWalletToEdit(item);
            setIsOpenCreateUpdatePanelForm(true);
        },
        handleClickDelete: deleteModal.open
    });

    // Filtering data using memo
    const associatedPaymentConcepts = useMemo(() => {
        const data = queries.wallet.get.data ?? [];

        if (!searchQuery.trim())
            return data;

        const query = searchQuery.toLowerCase();

        return data.filter(item =>
            item.name?.toLowerCase().includes(query)
        );
    }, [queries.wallet.get.data, searchQuery]);

    // Component functions
    const handleClickConfirmDeleteAcademicCycleWallet = async () => {
        if (!deleteModal.record)
            return;
        await mutations.wallet.delete.mutateAsync({ id: deleteModal.record.id, academicCycleId: context.academicCycleId! },
            {
                onSuccess: () => {
                    toast.success("Concepto de pago eliminado correctamente", { position: "top-right" });
                    deleteModal.close();
                    setAcademicCycleWalletToEdit({});
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error("Ocurrio un error al tratar de eliminar el concepto de pago seleccionado", { position: "top-right" });
                }
            }
        )
    }

    const onSubmit = async (academicCycleWalletItemRequestLike: Partial<AcademicCycleWalletItemRequest>) => {
        try {
            if (queries.wallet.get.data.some(item => item.name.trim().toLocaleLowerCase() === academicCycleWalletItemRequestLike.name?.trim().toLocaleLowerCase() && item.id !== academicCycleWalletToEdit?.id)) {
                toast.warning("Ya cuenta con un concepto de pago con el mismo nombre", { position: "top-right" });
                return;
            }

            loader.show("Guardando");
            await mutations.wallet.createUpdate.mutateAsync({
                id: academicCycleWalletToEdit?.id || "new",
                academicCycleWalletItemRequestLike
            }, {
                onSuccess: () => {
                    toast.success("Concepto de pago agregado a la cartera del ciclo escolar correctamente", { position: "top-right" });
                    loader.hide();
                    setAcademicCycleWalletToEdit({});
                    setIsOpenCreateUpdatePanelForm(false);
                }
            });
        } catch (error) {
            console.warn(error);
            loader.hide();
            toast.error("Ocurrió un error al tratar de guardar el registro", { position: "top-right" });
        }
    }

    if (queries.wallet.get.isError) {
        toast.error("No fue posible obtener información de la cartera del ciclo escolar", { position: "top-right" });
    }

    return (
        <>
            {/* Wallet table section */}
            <section className="flex flex-col gap-y-6">
                <SectionTitle
                    title="LISTADO DE CONCEPTOS DE PAGO ASOCIADOS AL CICLO ESCOLAR"
                    description="El siguiente listado contiene la información de los conceptos de pago para este ciclo escolar." />
                <TableRibbon
                    className="mb-0"
                    filterButton={{ show: false }}
                    exportButton={{ show: false }}
                    addButton={{
                        show: !context.isLocked,
                        label: "Asociar nuevo concepto",
                        disabled: queries.wallet.get.isLoading || queries.wallet.get.isError,
                        handleClick: () => {
                            setAcademicCycleWalletToEdit({});
                            setIsOpenCreateUpdatePanelForm(true);
                        }
                    }}
                    searchInput={{
                        show: true,
                        disabled: queries.wallet.get.isLoading || queries.wallet.get.isError,
                        placeholder: "Búsqueda general por concepto",
                        tooltip: "Búsqueda general por concepto",
                        onKeyDown: () => { },
                        onChange: (event) => setSearchQuery(event.target.value || ""),
                        onClickClear: () => setSearchQuery("")
                    }}
                />
                <Table
                    data={associatedPaymentConcepts}
                    isLoading={queries.wallet.get.isLoading}
                    enablePagination={false}
                    columns={columns}
                    properties={properties}
                    actions={actions}
                    skeletonRows={4}
                />
            </section>

            {/* Create & update payment concept form */}
            {
                (!context.isLocked && isOpenCreateUpdatePanelForm) && (
                    <AcademicCycleWalletPanelForm
                        academicCycleWalletItemResponse={academicCycleWalletToEdit}
                        handleClickClose={() => {
                            setAcademicCycleWalletToEdit({});
                            setIsOpenCreateUpdatePanelForm(false);
                        }}
                        onSubmit={onSubmit}
                    />
                )
            }

            {/* Delete single record modal */}
            {
                (!context.isLocked && deleteModal.record)  && (
                    <Modal
                        open={deleteModal.isOpen}
                        type="delete"
                        title={`¿Estas seguro de eliminar el registro ${deleteModal.record.name}?`}
                        message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                        isLoading={mutations.wallet.delete.isPending}
                        cancelButton={{
                            label: "Cancelar",
                            onClick: () => deleteModal.close()
                        }}
                        confirmButton={{
                            label: "Sí, eliminar",
                            onClick: handleClickConfirmDeleteAcademicCycleWallet
                        }}
                    />
                )
            }
        </>
    )
}
