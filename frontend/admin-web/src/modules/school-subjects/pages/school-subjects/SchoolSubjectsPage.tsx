import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Modal } from "@/shared/components/modal/Modal";
import { Table } from "@/shared/components/table/Table";
import { downloadDataToCsvFile } from "@/lib/extensions/csv";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { useSchoolSubjectsPage } from "./hooks/useSchoolSubjectsPage";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { useSchoolSubjectsPageTable } from "./hooks/useSchoolSubjectsPageTable";
import { SchoolSubjectsAdvancedFilters } from "./components/SchoolSubjectsAdvancedFilters";

export const SchoolSubjectsPage = () => {
  // Component hooks & stores
  const navigate = useNavigate();
  const { loader, advancedFilters, deleteModal, queries, mutations } = useSchoolSubjectsPage();
  const { columns, properties, actions } = useSchoolSubjectsPageTable({ handleClickDelete: deleteModal.open });

  // Component functions
  const handleClickExport = async () => {
    loader.show('Descargando información', 'Por favor espere...');

    const data = await mutations.schoolSubjects.export.mutateAsync();

    if (!data || !Array.isArray(data)) {
      loader.hide();
      toast.info('No se cuenta con información para descargar', { position: "top-right" });
      return;
    }

    const headers = [
      { label: 'Id', key: 'id' },
      { label: 'Nombre', key: 'name' },
      { label: 'Descripción', key: 'description' },
      { label: 'Estado', key: 'status' },
      { label: 'Nivel Académico', key: 'academicLevel.name' },
      { label: 'Grado Educativo', key: 'educationLevel.name' }
    ];

    downloadDataToCsvFile('Materias escolares', headers, data);

    setTimeout(() => loader.hide(), 500);
  }

  const handleClickConfirmDeleteSchoolSubject = async () => {
    if (!deleteModal.record)
      return;
    await mutations.schoolSubjects.delete.mutateAsync({ id: deleteModal.record.id },
      {
        onSuccess: () => {
          toast.success('Materia escolar eliminada correctamente', { position: "top-right" });
          deleteModal.close();
        },
        onError: (error: any) => {
          console.warn(error);
          toast.error('Ocurrio un error al tratar de eliminar la materia escolar', { position: "top-right" });
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
            { label: "Materias escolares", to: "/school-subjects" }
          ]} />
        </div>

        <PageTitle title="Materias escolares" subtitle="Gestiona las materias escolares que estarán disponibles en el colegio" />

        <section className="flex flex-col gap-8 mt-14">

          {/* Table ribbon options */}
          <TableRibbon
            handleClickAdvancedFilters={() => advancedFilters.open()}
            handleClickAdd={() => navigate("/school-subjects/new")}
            handleClickExport={handleClickExport}
            inputSearchTooltip="Búsqueda general por nombre y descripción"
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

      </div>
    </>
  )
}