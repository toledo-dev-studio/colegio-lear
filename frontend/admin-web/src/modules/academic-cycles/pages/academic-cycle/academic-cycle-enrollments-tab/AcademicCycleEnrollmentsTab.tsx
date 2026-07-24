import { useSearchParams } from "react-router";
import { toast } from "sonner";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { SectionTitle } from "@/shared/components/section-title/SectionTitle";
import { useAcademicCycleEnrollmentsTab } from "./hooks/useAcademicCycleEnrollmentsTab";
import { useAcademicCycleEnrollmentsTable } from "./hooks/useAcademicCycleEnrollmentsTable";
import { AcademicCycleEnrollmentPanelForm } from "./components/AcademicCycleEnrollmentPanelForm";
import { AcademicCycleEnrollmentsPanelFilters } from "./components/AcademicCycleEnrollmentsPanelFilters";
import type { AcademicCycleEnrollmentRequest } from "@/interfaces/requests/academic-cycle-enrollment.request";

export const AcademicCycleEnrollmentsTab = () => {
  // Componen hooks & stores
  const [searchParams, setSearchParams] = useSearchParams();

  // Context hooks and stores configuration
  const { context, loader, queries, mutations, advancedFiltersPanel, enrollmentPanel, deleteModal } = useAcademicCycleEnrollmentsTab();
  const { columns, properties, actions } = useAcademicCycleEnrollmentsTable({
    handleClickEdit: enrollmentPanel.open,
    handleClickDelete: deleteModal.open
  });

  // Component functions
  const handleClickConfirmDeleteEnrollment = async () => {
    if (!deleteModal.record)
      return;
    await mutations.enrollments.delete.mutateAsync({ academicCycleId: context.academicCycleId!, id: deleteModal.record.id },
      {
        onSuccess: () => {
          toast.success("El estudiante se eliminó correctamente del ciclo escolar", { position: "top-right" });
          deleteModal.close();
        },
        onError: (error) => {
          console.warn(error);
          toast.error("Ocurrio un error al tratar de eliminar el alumno del ciclo escolar", { position: "top-right" });
        }
      }
    )
  }

  const onSubmit = async (academicCycleEnrollmentRequestLike: Partial<AcademicCycleEnrollmentRequest>) => {
    try {
      loader.show("Guardando");
      await mutations.enrollments.createUpdate.mutateAsync({
        id: enrollmentPanel.data.id || "new",
        academicCycleEnrollmentRequestLike
      }, {
        onSuccess: () => {
          toast.success("Estudiante inscrito al ciclo escolar correctamente", { position: "top-right" });
          loader.hide();
          enrollmentPanel.close();
        }
      });
    } catch (error) {
      console.warn(error);
      loader.hide();
      toast.error("Ocurrió un error al tratar de inscribir al estudiante en el ciclo escolar", { position: "top-right" });
    }
  }

  if (queries.enrollments.paged.isError) {
    toast.error("No fue posible obtener información asociada al ciclo escolar", { position: "top-right" });
  }

  return (
    <>
      {/* School subjects table section */}
      <section className="flex flex-col gap-y-6">
        <SectionTitle
          title="LISTADO DE ESTUDIANTES INSCRITOS AL CICLO ESCOLAR"
          description="El siguiente listado contiene la información de los estudiantes inscritos al ciclo escolar según el grupo escolar seleccionado." />

        <TableRibbon
          exportButton={{ disabled: true, show: false }}
          addButton={{
            show: context.academicCycle?.enrollmentOpen && (context.academicCycle.status === "active" || context.academicCycle.status === "upcoming"),
            label: "Nueva incripción",
            disabled: queries.enrollments.paged.isLoading || queries.enrollments.paged.isError,
            handleClick: () => enrollmentPanel.open({})
          }}
          filterButton={{
            disabled: queries.enrollments.paged.isLoading || queries.enrollments.paged.isError,
            handleClick: advancedFiltersPanel.open
          }}
          searchInput={{
            disabled: queries.enrollments.paged.isLoading || queries.enrollments.paged.isError,
            tooltip: "Búsqueda por código de inscripción & alumno",
            placeholder: "Búsqueda por código de inscripción & alumno",
            onKeyDown: (event, query) => {
              if (event.key !== "Enter")
                return;
              if (!query.length) {
                searchParams.delete("query");
              } else {
                searchParams.set("query", query);
              }
              setSearchParams(searchParams);
            }
          }}
        />

        <Table
          data={queries.enrollments.paged.data}
          isLoading={queries.enrollments.paged.isLoading}
          enablePagination={true}
          totalPages={queries.enrollments.paged.totalPages}
          columns={columns}
          properties={properties}
          actions={actions}
        />
      </section>

      {/* Advanced filters panel */}
      {
        advancedFiltersPanel.isOpen && (
          <AcademicCycleEnrollmentsPanelFilters
            academicCycleSchoolGroups={queries.schoolGroups.get.data}
            handleClickClose={advancedFiltersPanel.close}
          />
        )
      }

      {/* Quick enrollment panel */}
      {
        enrollmentPanel.isOpen && (
          <AcademicCycleEnrollmentPanelForm
            academicCycleEnrollmentResponse={enrollmentPanel.data}
            onSubmit={onSubmit}
            handleClickClose={enrollmentPanel.close}
            academicCycleSchoolGroups={queries.schoolGroups.get.data} />
        )
      }

      {/* Delete single record modal */}
      {
        (!context.isLocked && deleteModal.record) && (
          <Modal
            open={deleteModal.isOpen}
            type="delete"
            title={"¿Estas seguro de eliminar el registro seleccionado?"}
            message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
            isLoading={mutations.enrollments.delete.isPending}
            cancelButton={{
              label: "Cancelar",
              onClick: () => deleteModal.close()
            }}
            confirmButton={{
              label: "Sí, eliminar",
              onClick: handleClickConfirmDeleteEnrollment
            }}
          />
        )
      }
    </>
  )
}
