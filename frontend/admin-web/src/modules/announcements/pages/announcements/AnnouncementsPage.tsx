import { useNavigate } from "react-router";
import { toast } from "sonner"

import { Modal } from "@/shared/components/modal/Modal";
import { Table } from "@/shared/components/table/Table";
import { downloadDataToCsvFile, type CsvHeader } from "@/lib/extensions/csv";
import { useAnnouncementsPage } from "./hooks/useAnnouncementsPage";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { useAnnouncementsPageTable } from "./hooks/useAnnouncementsPageTable";
import { AnnouncementsAdvancedFilters } from "./components/AnnouncementsAdvancedFilters";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import type { AnnouncementResponse } from "@/interfaces/responses/announcement.response";
import { labelOf } from "@/lib/key-value-pairs/key-value-pair";
import { ANNOUNCEMENTS_STATUSES, AUDIENCE_TYPES } from "@/lib/key-value-pairs/key-value-pair-catalogs";

export const AnnouncementsPage = () => {
  // Component hooks & stores
  const navigate = useNavigate();
  const canWrite = usePermission("announcements", "can-write");
  const { loader, advancedFilters, deleteModal, queries, mutations } = useAnnouncementsPage();
  const { columns, properties, actions } = useAnnouncementsPageTable({ handleClickDelete: deleteModal.open });

  // Component functions
  const handleClickExport = async () => {
    loader.show("Descargando información", "Por favor espere...");

    const data = await mutations.announcements.export.mutateAsync();

    if (!data || !Array.isArray(data)) {
      loader.hide();
      toast.info("No se cuenta con información para descargar", { position: "top-right" });
      return;
    }

    const headers: CsvHeader<AnnouncementResponse>[] = [
      { label: "Identificador", key: "id" },
      { label: "Nombre", key: "name" },
      { label: "Descripción", key: "description" },
      { label: "Fecha de publicación", key: "publishedAt" },
      { label: "Fecha de expiración", key: "expiresAt" },
      { label: "Audiencia(s)", key: "audience", render: (item) => item.audience.map(a => labelOf(AUDIENCE_TYPES, a)).join(", ") },
      { label: "Estado", key: "status", render: (item) => labelOf(ANNOUNCEMENTS_STATUSES, item.status) },
    ];

    downloadDataToCsvFile("Campañas & comunicados", headers, data);

    setTimeout(() => loader.hide(), 500);
  }

  const handleClickConfirmDeleteAnnouncement = async () => {
    if (!deleteModal.record)
      return
    await mutations.announcements.delete.mutateAsync({ id: deleteModal.record.id },
      {
        onSuccess: () => {
          toast.success("Campaña eliminada correctamente", { position: "top-right" });
          deleteModal.close();
        },
        onError: (error) => {
          console.warn(error);
          toast.error("Ocurrio un error al tratar de eliminar la campaña", { position: "top-right" });
        }
      }
    );
  }

  return (
    <>
      <section className="page-main-section">

        <Breadcrumb items={[
          { label: "Seguimiento escolar" },
          { label: "Comunicados & campañas", to: "/announcements" },
        ]} />

        <PageTitle title="Comunicados & campañas" subtitle="Gestiona las comunicados & campañas disponibles en el colegio y la organización" />

        {/* Table ribbon options */}
        <TableRibbon
          addButton={{ show: canWrite, handleClick: () => navigate("/announcements/new") }}
          filterButton={{ handleClick: advancedFilters.open }}
          exportButton={{ handleClick: handleClickExport }}
          searchInput={{ tooltip: "Búsqueda general por nombre y descripción", placeholder: "Búsqueda general por nombre y descripción" }}
        />

        {/* Table content*/}
        <Table
          data={queries.announcements.paged.data}
          isLoading={queries.announcements.paged.isFetching}
          enablePagination={true}
          columns={columns}
          properties={properties}
          actions={actions}
          totalPages={queries.announcements.paged.totalPages}
        />

        {/* Delete single record modal */}
        {
          (deleteModal.isOpen && deleteModal.record) && (
            <Modal
              open={deleteModal.isOpen}
              type="delete"
              title={`¿Estas seguro de eliminar el registro "${deleteModal.record.name}"?`}
              message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
              isLoading={mutations.announcements.delete.isPending}
              cancelButton={{
                label: "Cancelar",
                onClick: () => deleteModal.close()
              }}
              confirmButton={{
                label: "Sí, eliminar",
                onClick: handleClickConfirmDeleteAnnouncement
              }}
            />
          )
        }

        {/* Advanced filters panel */}
        {
          advancedFilters.isOpen && (
            <AnnouncementsAdvancedFilters
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
