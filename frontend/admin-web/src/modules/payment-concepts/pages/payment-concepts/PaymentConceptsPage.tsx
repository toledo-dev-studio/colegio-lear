import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { downloadDataToCsvFile } from "@/lib/extensions/csv";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { usePaymentConceptsPage } from "./hooks/usePaymentConceptsPage";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { usePaymentConceptsPageTable } from "./hooks/usePaymentConceptsPageTable";
import { PaymentConceptsAdvancedFilters } from "./components/PaymentConceptsAdvancedFilters";

export const PaymentConceptsPage = () => {
  // Component hooks & stores
  const navigate = useNavigate();
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

    const headers = [
      { label: "Id", key: "id" },
      { label: "Nombre", key: "name" },
      { label: "Descripción", key: "description" },
      { label: "Monto de pago", key: "amount" },
      { label: "¿Condonación?", key: "allowForgiveness" },
      { label: "Estado", key: "status" }
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
          toast.error("Ocurrio un error al tratar de eliminar el concepto de pago", { position: "top-right" });
        }
      }
    );
  }

  return (
    <>
      <div className="w-full py-12 px-10 lg:px-15">

        <div className="mb-10">
          <Breadcrumb items={[
            { label: "Configuración escolar" },
            { label: "Conceptos de pago", to: "/payment-concepts" },
          ]} />
        </div>

        <PageTitle title="Conceptos de pago" subtitle="Gestiona los conceptos de pago disponibles en el colegio  " />

        <section className="flex flex-col gap-8 mt-14">

          {/* Table ribbon options */}
          <TableRibbon
            handleClickAdvancedFilters={() => advancedFilters.open()}
            handleClickAdd={() => navigate("/payment-concepts/new")}
            handleClickExport={handleClickExport}
            inputSearchTooltip="Búsqueda general por nombre, descripción y monto"
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
      </div>
    </>
  )
}
