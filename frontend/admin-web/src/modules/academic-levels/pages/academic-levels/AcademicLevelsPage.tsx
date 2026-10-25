import { useNavigate } from "react-router";
import { toast } from "sonner";
import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { downloadDataToCsvFile, type CsvHeader } from "@/lib/extensions/csv";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { useAcademicLevelsPage } from "./hooks/useAcademicLevelsPage";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { useAcademicLevelsPageTable } from "./hooks/useAcademicLevelsPageTable";
import { AcademicLevelsAdvancedFilters } from "./components/AcademicLevelsAdvancedFilters";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import type { AcademicLevelResponse } from "@/interfaces/responses/academic-level.response";

export const AcademicLevelsPage = () => {
  // Component hooks & stores
  const navigate = useNavigate();
  const canWrite = usePermission("academic-levels", "can-write");
  const { loader, advancedFilters, deleteModal, queries, mutations } = useAcademicLevelsPage();
  const { columns, properties, actions } = useAcademicLevelsPageTable({ handleClickDelete: deleteModal.open });

  // Component functions
  const handleClickExport = async () => {
    loader.show("Descargando información", "Por favor espere...");

    const data = await mutations.academicLevels.export.mutateAsync();

    if (!data || !Array.isArray(data)) {
      loader.hide();
      toast.info("No se cuenta con información para descargar", { position: "top-right" });
      return;
    }

    const headers: CsvHeader<AcademicLevelResponse>[] = [
      { label: "Identificador", key: "id" },
      { label: "Nombre", key: "name" },
      { label: "Descripción", key: "description" },
      { label: "¿Registro activo?", key: "isActive", render: (item) => item.isActive ? "Activo" : "Inactivo" },
    ];

    downloadDataToCsvFile("Niveles académicos", headers, data);

    setTimeout(() => loader.hide(), 500);
  }

  const handleClickConfirmDeleteAcademicLevel = async () => {
    if (!deleteModal.record)
      return;
    await mutations.academicLevels.delete.mutateAsync({ id: deleteModal.record.id },
      {
        onSuccess: () => {
          toast.success("Nivel académico eliminado correctamente", { position: "top-right" });
          deleteModal.close();
        },
        onError: (error) => {
          console.warn(error);
          showApiErrorToast(error, "Ocurrio un error al tratar de eliminar el nivel académico");
        }
      }
    );
  }

  if (queries.academicLevels.paged.isError) {
    showApiErrorToast(queries.academicLevels.paged.error, "No fue posible obtener información de los niveles académicos");
  }

  return (
    <>
      <section className="page-main-section">

        <Breadcrumb items={[
          { label: "Configuración escolar" },
          { label: "Niveles académicos", to: "/academic-levels" },
        ]} />

        <PageTitle title="Niveles académicos" subtitle="Gestiona los niveles académicos disponibles en la organización" />

        {/* Table ribbon options */}
        <TableRibbon
          addButton={{ show: canWrite, handleClick: () => navigate("/academic-levels/new") }}
          filterButton={{ handleClick: advancedFilters.open }}
          exportButton={{ handleClick: handleClickExport }}
          searchInput={{ tooltip: "Búsqueda general por nombre y descripción", placeholder: "Búsqueda general por nombre y descripción" }}
        />

        {/* Table content*/}
        <Table
          data={queries.academicLevels.paged.data}
          isLoading={queries.academicLevels.paged.isFetching}
          enablePagination={true}
          columns={columns}
          properties={properties}
          actions={actions}
          totalPages={queries.academicLevels.paged.totalPages}
        />

        {/* Delete single record modal */}
        {
          (deleteModal.isOpen && deleteModal.record) && (
            <Modal
              open={deleteModal.isOpen}
              type="delete"
              title={`¿Estas seguro de eliminar el registro "${deleteModal.record.name}"?`}
              message={"Se eliminará del sistema tanto el nivel académico como sus grados educativos relacionados y solo el administrador del sistema podrán recuperarlo"}
              isLoading={mutations.academicLevels.delete.isPending}
              cancelButton={{
                label: "Cancelar",
                onClick: () => deleteModal.close()
              }}
              confirmButton={{
                label: "Sí, eliminar",
                onClick: handleClickConfirmDeleteAcademicLevel
              }}
            />
          )
        }

        {/* Advanced filters panel */}
        {
          advancedFilters.isOpen && (
            <AcademicLevelsAdvancedFilters
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
