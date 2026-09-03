import { useNavigate } from "react-router";
import { toast } from "sonner";
import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { downloadDataToCsvFile, type CsvHeader } from "@/lib/extensions/csv";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { usePaymentConceptsPage } from "./hooks/usePaymentConceptsPage";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { usePaymentConceptsPageTable } from "./hooks/usePaymentConceptsPageTable";
import { PaymentConceptsAdvancedFilters } from "./components/PaymentConceptsAdvancedFilters";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import type { PaymentConceptResponse } from "@/interfaces/responses/payment-concept.response";

export const PaymentConceptsPage = () => {
  // Component hooks & stores
  const navigate = useNavigate();
  const canWrite = usePermission("payment-concepts", "can-write");
  const { loader, advancedFilters, deleteModal, queries, mutations } = usePaymentConceptsPage();
  const { columns, properties, actions } = usePaymentConceptsPageTable({ handleClickDelete: deleteModal.open });

  // Component functions
  const handleClickExport = async () => {
    loader.show("Descargando información", "Por favor espere...");

    const data = await mutations.paymentConcepts.export.mutateAsync();

    if (!data || !Array.isArray(data)) {
      loader.hide();
      toast.info("No se cuenta con información para descargar", { position: "top-right" });
      return;
    }

    const headers: CsvHeader<PaymentConceptResponse>[] = [
      { label: "Identificador", key: "id" },
      { label: "Nombre", key: "name" },
      { label: "Código", key: "code" },
      { label: "Monto de pago", key: "amount" },
      { label: "Descripción", key: "description" },
      { label: "¿Registro activo?", key: "isActive", render: (item) => item.isActive ? "Activo" : "Inactivo" },
      { label: "¿Permitir condonación?", key: "allowForgiveness", render: (item) => item.allowForgiveness ? "Permitido" : "No permitido" },
    ];

    downloadDataToCsvFile("Conceptos de pago", headers, data);

    setTimeout(() => loader.hide(), 500);
  }

  const handleClickConfirmDeletePaymentConcept = async () => {
    if (!deleteModal.record)
      return;
    await mutations.paymentConcepts.delete.mutateAsync({ id: deleteModal.record.id },
      {
        onSuccess: () => {
          toast.success("Concepto de pago eliminado correctamente", { position: "top-right" });
          deleteModal.close();
        },
        onError: (error) => {
          console.warn(error);
          showApiErrorToast(error, "Ocurrio un error al tratar de eliminar el concepto de pago");
        }
      }
    );
  }

  if (queries.paymentConcepts.paged.isError) {
    showApiErrorToast(queries.paymentConcepts.paged.error, "No fue posible obtener información de los conceptos de pago");
  }

  return (
    <>
      <section className="page-main-section">

        <Breadcrumb items={[
          { label: "Configuración escolar" },
          { label: "Conceptos de pago", to: "/payment-concepts" },
        ]} />

        <PageTitle title="Conceptos de pago" subtitle="Gestiona los conceptos de pago disponibles en el colegio  " />

        {/* Table ribbon options */}
        <TableRibbon
          addButton={{ show: canWrite, handleClick: () => navigate("/payment-concepts/new") }}
          filterButton={{ handleClick: advancedFilters.open }}
          exportButton={{ handleClick: handleClickExport }}
          searchInput={{ tooltip: "Búsqueda general por nombre y descripción", placeholder: "Búsqueda general por nombre y descripción" }}
        />

        {/* Table content*/}
        <Table
          data={queries.paymentConcepts.paged.data}
          isLoading={queries.paymentConcepts.paged.isFetching}
          enablePagination={true}
          columns={columns}
          properties={properties}
          actions={actions}
          totalPages={queries.paymentConcepts.paged.totalPages}
        />

        {/* Delete single record modal */}
        {
          (deleteModal.isOpen && deleteModal.record) && (
            <Modal
              open={deleteModal.isOpen}
              type="delete"
              title={`¿Estas seguro de eliminar el registro "${deleteModal.record.name}"?`}
              message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
              isLoading={mutations.paymentConcepts.delete.isPending}
              cancelButton={{
                label: "Cancelar",
                onClick: () => deleteModal.close()
              }}
              confirmButton={{
                label: "Sí, eliminar",
                onClick: handleClickConfirmDeletePaymentConcept
              }}
            />
          )
        }

        {/* Advanced filters panel */}
        {
          advancedFilters.isOpen && (
            <PaymentConceptsAdvancedFilters
              open={advancedFilters.isOpen}
              title="Filtros avanzados"
              handleClickClose={advancedFilters.close}
            />
          )
        }

      </section>
    </>
  )
}
