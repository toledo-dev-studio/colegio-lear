import { useState } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { useAcademicCycleWalletTab } from "./hooks/useAcademicCycleWalletTab";
import { AcademicCycleWalletForm } from "./components/AcademicCycleWalletForm";
import { useAcademicCycleWalletTable } from "./hooks/useAcademicCycleWalletTable";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import type { AcademicCycleWallet } from "@/interfaces/entites/academic-cycle-wallet";
import { TabSectionTitle } from "@/shared/components/tab-section-title/TabSectionTitle";

export const AcademicCycleWalletTab = () => {
    // Context hooks & stores configuration
    const { context, queries, mutations, deleteModal, loader } = useAcademicCycleWalletTab();

    // Componet hooks and stores
    const [academicCycleWallet, setAcademicCycleWallet] = useState<Partial<AcademicCycleWallet | undefined>>({});

    // Table hook configuration
    const { columns, properties, actions } = useAcademicCycleWalletTable(setAcademicCycleWallet, deleteModal.open);

    // Component functions
    const handleClickConfirmDeleteWallet = async () => {
        if (!deleteModal.record)
            return;
        await mutations.wallet.delete.mutateAsync({ academicCycleId: context.academicCycleId, academicCycleWalletId: deleteModal.record.id },
            {
                onSuccess: () => {
                    toast.success("Concepto de pago eliminado correctamente", { position: "top-right" });
                    deleteModal.close();
                    setAcademicCycleWallet({});
                },
                onError: (error) => {
                    console.warn(error);
                    toast.error("Ocurrio un error al tratar de eliminar el concepto de pago seleccionado", { position: "top-right" });
                }
            }
        )
    }

    const onSubmit = async (academicCycleWalletLike: Partial<AcademicCycleWallet>) => {
        try {
            loader.show("Guardando");
            await mutations.wallet.createUpdate.mutateAsync({ academicCycleWalletLike }, {
                onSuccess: () => {
                    toast.success("Concepto de pago agregado a la cartera del ciclo escolar correctamente", { position: "top-right" });
                    loader.hide();
                    setAcademicCycleWallet({});
                }
            });
        } catch (error) {
            console.warn(error);
            loader.hide();
            toast.error("Ocurrió un error al tratar de guardar el registro", { position: "top-right" });
        }
    }

    if (queries.wallet.isError) {
        toast.error("No fue posible obtener información de la cartera del ciclo escolar", { position: "top-right" });
        return <Navigate to="/academic-cycles" />;
    }

    if (queries.wallet.isLoading) {
        return (
            <>
                <div className="w-full relative mx-auto h-full my-4">
                    <CustomFullScreenLoading className="relative" title="Cargando cartera de ciclo escolar" subtitle="Por favor espere..." />
                </div>
            </>
        );
    }

    return (
        <>
            {/* Wallet table section */}
            <section className="flex flex-col gap-y-6">
                <TabSectionTitle
                    title="LISTADO DE CONCEPTOS DE PAGO ASOCIADOS AL CICLO ESCOLAR"
                    description="El siguiente listado contiene la información de los conceptos de pago para este ciclo escolar." />
                <Table
                    data={queries.wallet.data}
                    isLoading={queries.wallet.isLoading}
                    enablePagination={false}
                    columns={columns}
                    properties={properties}
                    actions={actions}
                />
            </section>

            {/* Create & update payment concept form */}
            {
                !context.isLocked && (
                    <AcademicCycleWalletForm
                        academicCycleWallet={academicCycleWallet}
                        setAcademicCycleWallet={setAcademicCycleWallet}
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
                        title={`¿Estas seguro de eliminar el registro ${deleteModal.record.paymentConcept?.name}`}
                        message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                        isLoading={mutations.wallet.delete.isPending}
                        cancelButton={{
                            label: "Cancelar",
                            onClick: () => deleteModal.close()
                        }}
                        confirmButton={{
                            label: "Sí, eliminar",
                            onClick: handleClickConfirmDeleteWallet
                        }}
                    />
                )
            }
        </>
    )
}
