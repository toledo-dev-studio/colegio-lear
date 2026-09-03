import { useNavigate } from "react-router";
import { toast } from "sonner";
import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";

import { Modal } from "@/shared/components/modal/Modal";
import { Table } from "@/shared/components/table/Table";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { useSchoolSubjectsPage } from "./hooks/useSchoolSubjectsPage";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { downloadDataToCsvFile, type CsvHeader } from "@/lib/extensions/csv";
import { useSchoolSubjectsPageTable } from "./hooks/useSchoolSubjectsPageTable";
import { SchoolSubjectsAdvancedFilters } from "./components/SchoolSubjectsAdvancedFilters";
import type { SchoolSubjectResponse } from "@/interfaces/responses/school-subject.response";

export const SchoolSubjectsPage = () => {
  // Component hooks & stores
  const navigate = useNavigate();
  const canWrite = usePermission("school-subjects", "can-write");
  const { loader, advancedFilters, deleteModal, queries, mutations } = useSchoolSubjectsPage();
  const { columns, properties, actions } = useSchoolSubjectsPageTable({ handleClickDelete: deleteModal.open });

  // Component functions
  const handleClickExport = async () => {
    loader.show("Descargando información", "Por favor espere...");

    const data = await mutations.schoolSubjects.export.mutateAsync();

    if (!data || !Array.isArray(data)) {
      loader.hide();
      toast.info("No se cuenta con información para descargar", { position: "top-right" });
      return;
    }

    const headers: CsvHeader<SchoolSubjectResponse>[] = [
      { label: "Identificador", key: "id" },
      { label: "Nombre", key: "name" },
      { label: "Descripción", key: "description" },
      { label: "Nivel académico", key: "academicLevel", render: (item) => item.academicLevel?.name || "" },
      { label: "Grado educativo", key: "educationLevel", render: (item) => item.educationLevel?.name || "" },
      { label: "¿Registro activo?", key: "isActive", render: (item) => item.isActive ? "Activo" : "Inactivo" },
    ];

    downloadDataToCsvFile("Materias escolares", headers, data);

    setTimeout(() => loader.hide(), 500);
  }

  const handleClickConfirmDeleteSchoolSubject = async () => {
    if (!deleteModal.record)
      return;
    await mutations.schoolSubjects.delete.mutateAsync({ id: deleteModal.record.id },
      {
        onSuccess: () => {
          toast.success("Materia escolar eliminada correctamente", { position: "top-right" });
          deleteModal.close();
        },
        onError: (error: any) => {
          console.warn(error);
          showApiErrorToast(error, "Ocurrio un error al tratar de eliminar la materia escolar");
        }
      }
    );
  }

  if (queries.schoolSubjects.paged.isError) {
    showApiErrorToast(queries.schoolSubjects.paged.error, "No fue posible obtener información de las materias escolares");
  }

  return (
    <>
      <section className="page-main-section">

        <Breadcrumb items={[
          { label: "Configuración escolar" },
          { label: "Materias escolares", to: "/school-subjects" }
        ]} />

        <PageTitle title="Materias escolares" subtitle="Gestiona las materias escolares que estarán disponibles en el colegio" />

        {/* Table ribbon options */}
        <TableRibbon
          addButton={{ show: canWrite, handleClick: () => navigate("/school-subjects/new") }}
          filterButton={{ handleClick: advancedFilters.open }}
          exportButton={{ handleClick: handleClickExport }}
          searchInput={{ tooltip: "Búsqueda general por nombre y descripción", placeholder: "Búsqueda general por nombre y descripción" }}
        />

        {/* Table content*/}
        <Table
          data={queries.schoolSubjects.paged.data}
          isLoading={queries.schoolSubjects.paged.isFetching}
          enablePagination={true}
          columns={columns}
          properties={properties}
          actions={actions}
          totalPages={queries.schoolSubjects.paged.totalPages}
        />

        {/* Delete single record modal */}
        {
          (deleteModal.isOpen && deleteModal.record) && (
            <Modal
              open={deleteModal.isOpen}
              type="delete"
              title={`¿Estas seguro de eliminar el registro "${deleteModal.record.name}"?`}
              message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
              isLoading={mutations.schoolSubjects.delete.isPending}
              cancelButton={{
                label: "Cancelar",
                onClick: () => deleteModal.close()
              }}
              confirmButton={{
                label: "Sí, eliminar",
                onClick: handleClickConfirmDeleteSchoolSubject
              }}
            />
          )
        }

        {/* Advanced filters panel */}
        {
          advancedFilters.isOpen && (
            <SchoolSubjectsAdvancedFilters
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