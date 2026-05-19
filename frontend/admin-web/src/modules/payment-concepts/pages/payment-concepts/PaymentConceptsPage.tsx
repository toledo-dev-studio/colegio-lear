import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner"

import { downloadDataToCsvFile } from "@/lib/extensions/csv";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import { CustomTableListRibbon } from "@/shared/components/CustomTableListRibbon";
import { CustomPagination } from "@/shared/components/CustomPagination";
import { CustomDeleteModal } from "@/shared/components/CustomDeleteModal";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useExportPaymentConcepts } from "../../hooks/useExportPaymentConcepts";
import { PaymentConceptsTable } from "./components/PaymentConceptsTable";
import type { PaymentConcept } from "@/interfaces/entites/payment-concept";
import { useDeletePaymentConcept } from "../../hooks/useDeletePaymentConcept";
import { PaymentConceptsAdvancedFilters } from "./components/PaymentConceptsAdvancedFilters";
import { useGetPagedPaymentConcepts } from "../../hooks/useGetPagedPaymentConcepts";

export const PaymentConceptsPage = () => {

  const navigate = useNavigate();

  const [isOpenSingleDeleteModal, setIsOpenSingleDeleteModal] = useState<boolean>(false);
  const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
  const [paymentConceptToDelete, setPaymentConceptToDelete] = useState<PaymentConcept | undefined>(undefined);

    const pagedPaymentConceptsQuery = useGetPagedPaymentConcepts();
    const deletePaymentConceptMutation = useDeletePaymentConcept();
    const exportPaymentConceptsMutation = useExportPaymentConcepts();

  const { showLoading, hideLoading } = useLoaderStore();

  const handleClickAdd = () => {
    navigate('/payment-concepts/new');
  }

  const handleClickExport = async () => {
    showLoading('Descargando información', 'Por favor espere...');

    const data = await exportPaymentConceptsMutation.mutateAsync();

    if (!data || !Array.isArray(data)) {
      hideLoading();
      toast.info('No se cuenta con información para descargar');
      return;
    }

    const headers = [
      { label: 'Id', key: 'id' },
      { label: 'Nombre', key: 'name' },
      { label: 'Descripción', key: 'description' },
      { label: 'Monto de pago', key: 'amount' },
      { label: '¿Condonación?', key: 'allowForgiveness' },
      { label: 'Estado', key: 'status' }
    ];

    downloadDataToCsvFile('Conceptos de pago', headers, data);

    setTimeout(() => hideLoading(), 500);
  }

  const handleClickAdvancedFilters = () => {
    setIsOpenAdvancedFiltersPanel(true);
  }

  const handleClickEditRow = (item: PaymentConcept) => {
    navigate(`/payment-concepts/${item.id}`);
  }

  const handleClickDeleteRow = (item: PaymentConcept) => {
    setPaymentConceptToDelete(item);
    setIsOpenSingleDeleteModal(true);
  }

  const handleClickCancelDelteJobTitle = () => {
    setPaymentConceptToDelete(undefined);
    setIsOpenSingleDeleteModal(false);
  }

  const handleClickDelteJobTitle = async () => {
    await deletePaymentConceptMutation.mutateAsync({ id: paymentConceptToDelete?.id! },
      {
        onSuccess: () => {
          toast.success('Concepto de pago eliminado correctamente');
          setPaymentConceptToDelete(undefined);
          setIsOpenSingleDeleteModal(false);
        },
        onError: (error) => {
          console.warn(error);
          toast.error('Ocurrio un error al tratar de eliminar el concepto de pago');
        }
      }
    );
  }

  const handleClickCloseAdvancedFiltersPanel = () => {
    setIsOpenAdvancedFiltersPanel(false);
  }

  return (
    <>
      <div className="w-full py-12 px-10 lg:px-15">

        <CustomPageTitle title="Conceptos de pago" subtitle="Gestiona los conceptos de pago disponibles en el colegio  " />

        <div className="flex flex-col gap-8 mt-14">

          {/* Table ribbon options */}
          <CustomTableListRibbon
            handleClickAdvancedFilters={handleClickAdvancedFilters}
            handleClickAdd={handleClickAdd}
            handleClickExport={handleClickExport}
            disabledExport={exportPaymentConceptsMutation.isPending}
          />

          {/* Table content*/}
          <PaymentConceptsTable
            data={pagedPaymentConceptsQuery.data?.data ?? []}
            isLoading={pagedPaymentConceptsQuery.isLoading}
            handleClickEditRow={handleClickEditRow}
            handleClickDeleteRow={handleClickDeleteRow}
          />

          {/* Pagination top element */}
          {
            (!pagedPaymentConceptsQuery.isLoading && pagedPaymentConceptsQuery.data?.data.length) && (
              <div className="flex items-center justify-center my-8">
                <CustomPagination totalPages={pagedPaymentConceptsQuery.data.totalPages} />
              </div>
            )
          }

          {/* Delete single record modal */}
          {
            paymentConceptToDelete && (
              <CustomDeleteModal
                open={isOpenSingleDeleteModal}
                title={`¿Estas seguro de eliminar el registro ${paymentConceptToDelete?.name}`}
                message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                isLoading={deletePaymentConceptMutation.isPending}
                handleClickConfirm={handleClickDelteJobTitle}
                handleClickCancel={handleClickCancelDelteJobTitle}
              />
            )
          }

          {/* Advanced filters panel */}
          {
            isOpenAdvancedFiltersPanel && (
              <PaymentConceptsAdvancedFilters
                open={isOpenAdvancedFiltersPanel}
                title="Filtros avanzados"
                handleClickClose={handleClickCloseAdvancedFiltersPanel}
              />
            )
          }

        </div>
      </div>
    </>
  )
}
