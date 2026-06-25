import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { useJobTitlesPage } from "./hooks/useJobTitlesPage";
import { downloadDataToCsvFile } from "@/lib/extensions/csv";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { useJobTitlesPageTable } from "./hooks/useJobTitlesPageTable";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { JobTitlesAdvancedFilters } from "./components/JobTitlesAdvancedFilters";

export const JobTitlesPage = () => {
  // Component hooks & stores
  const navigate = useNavigate();
  const { loader, advancedFilters, deleteModal, queries, mutations } = useJobTitlesPage();
  const { columns, properties, actions } = useJobTitlesPageTable({ handleClickDelete: deleteModal.open });

  // Component functions
  const handleClickExport = async () => {
    loader.show("Descargando información", "Por favor espere...");

    const data = await mutations.jobTitles.export.mutateAsync();

    if (!data || !Array.isArray(data)) {
      loader.hide();
      toast.info("No se cuenta con información para descargar", { position: "top-right" });
      return;
    }

    const headers = [
      { label: "Id", key: "id" },
      { label: "Nombre", key: "name" },
      { label: "Descripción", key: "description" },
      { label: "Estado", key: "status" }
    ];

    downloadDataToCsvFile("Puestos de trabajo", headers, data);

    setTimeout(() => loader.hide(), 500);
  }

  const handleClickConfirmDeleteJobTitle = async () => {
    await mutations.jobTitles.delete.mutateAsync({ id: deleteModal.record?.id! },
      {
        onSuccess: () => {
          toast.success("Puesto de trabajo eliminado correctamente", { position: "top-right" });
          deleteModal.close();
        },
        onError: (error) => {
          console.warn(error);
          toast.error("Ocurrio un error al tratar de eliminar el puesto de trabajo", { position: "top-right" });
        }
      }
    );
  }

  return (
    <>
      <div className="w-full py-12 px-10 lg:px-15">

        <div className="mb-10">
          <Breadcrumb items={[
            { label: "Seguridad" },
            { label: "Puestos de trabajo", to: "/job-titles" },
          ]} />
        </div>

        <PageTitle title="Puestos de trabajo" subtitle="Gestiona los puestos de trabajo disponibles en la organización" />

        <section className="flex flex-col gap-8 mt-14">

          {/* Table ribbon options */}
          <TableRibbon
            addButton={{ handleClick: () => navigate("/job-titles/new") }}
            filterButton={{ handleClick: advancedFilters.open }}
            exportButton={{ handleClick: handleClickExport }}
            searchInput={{ tooltip: "Búsqueda general por nombre y descripción", placeholder: "Búsqueda general por nombre y descripción" }}
          />

          {/* Table content*/}
          <Table
            data={queries.jobTitles.paged.data}
            isLoading={queries.jobTitles.paged.isFetching}
            enablePagination={true}
            columns={columns}
            properties={properties}
            actions={actions}
            totalPages={queries.jobTitles.paged.totalPages}
          />

          {/* Delete single record modal */}
          {
            (deleteModal.isOpen && deleteModal.record) && (
              <Modal
                open={deleteModal.isOpen}
                type="delete"
                title={`¿Estas seguro de eliminar el registro "${deleteModal.record.name}"?`}
                message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                isLoading={mutations.jobTitles.delete.isPending}
                cancelButton={{
                  label: "Cancelar",
                  onClick: () => deleteModal.close()
                }}
                confirmButton={{
                  label: "Sí, eliminar",
                  onClick: handleClickConfirmDeleteJobTitle
                }}
              />
            )
          }

          {/* Advanced filters panel */}
          {
            advancedFilters.isOpen && (
              <JobTitlesAdvancedFilters
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
