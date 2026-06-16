import { useState } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useAcademicCycleEnrollmentsTab } from "./hooks/useAcademicCycleEnrollmentsTab";
import { useAcademicCycleEnrollmentsTable } from "./hooks/useAcademicCycleEnrollmentsTable";
import { AcademicCycleEnrollmentsFilters } from "./components/AcademicCycleEnrollmentsFilters";
import { AcademicCycleEnrollmentPanelForm } from "./components/AcademicCycleEnrollmentPanelForm";
import { type AcademicCycleSchoolGroupEnrollment } from "@/interfaces/entites/academic-cycle-school-group-enrollment";

export const AcademicCycleEnrollmentsTab = () => {
  // Component hooks and stores
  const [isActiveEnrollmentPanel, setIsActiveEnrollmentPanel] = useState<boolean>();

  // Context hooks and stores configuration
  const { context, loader, queries, mutations, deleteModal } = useAcademicCycleEnrollmentsTab();

  // Use state to enroll a new student to academic cycle
  const [academicCycleSchoolGroupEnrollment, setAcademicCycleSchoolGroupEnrollment] = useState<Partial<AcademicCycleSchoolGroupEnrollment> | undefined>();

  // Table hook functions
  const onClickCreateUpdateEnrollment = (item?: AcademicCycleSchoolGroupEnrollment) => {
    setAcademicCycleSchoolGroupEnrollment(item);
    setIsActiveEnrollmentPanel(true);
  }

  // Table hook configuration
  const { columns, properties, actions } = useAcademicCycleEnrollmentsTable(onClickCreateUpdateEnrollment, deleteModal.open);

  // Component functions
  const clearSelection = () => {
    setAcademicCycleSchoolGroupEnrollment(undefined);
    setIsActiveEnrollmentPanel(undefined);
  }

  const handleClickConfirmDeleteEnrollment = async () => {
    if (!deleteModal.record)
      return;
    await mutations.enrollments.delete.mutateAsync({ academicCycleId: context.academicCycleId!, academicCycleSchoolGroupId: deleteModal.record.academicCycleSchoolGroupId, academicCycleSchoolGroupEnrollmentId: deleteModal.record.id },
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

  const onSubmit = async (enrollmentLike: Partial<AcademicCycleSchoolGroupEnrollment>) => {
    try {
      loader.show("Guardando");
      await mutations.enrollments.createUpdate.mutateAsync({ enrollmentLike }, {
        onSuccess: () => {
          toast.success("Estudiante inscrito al ciclo escolar correctamente", { position: "top-right" });
          loader.hide();
          clearSelection();
        }
      });
    } catch (error) {
      console.warn(error);
      loader.hide();
      toast.error("Ocurrió un error al tratar de inscribir al estudiante en el ciclo escolar", { position: "top-right" });
    }
  }

  if (queries.schoolGroups.isError) {
    toast.error("No fue posible obtener información asociada al ciclo escolar", { position: "top-right" });
    return <Navigate to="/academic-cycles" />;
  }

  if (queries.schoolGroups.isLoading) {
    return (
      <>
        <div className="w-full relative mx-auto h-full my-4">
          <CustomFullScreenLoading className="relative" title="Cargando información del ciclo escolar" subtitle="Por favor espere..." />
        </div>
      </>
    );
  }

  return (
    <>
      {/* Search academic cycle enrollments form */}
      <AcademicCycleEnrollmentsFilters
        isLoading={queries.enrollments.isFetching}
        academicCycleSchoolGroups={queries.schoolGroups.data}
        handleAddEnrollment={() => onClickCreateUpdateEnrollment(undefined)} />

      {/* School subjects table section */}
      <section className="flex flex-col gap-y-6">
        {/* School subjects table */}
        <Table
          data={queries.enrollments.data}
          isLoading={queries.enrollments.isFetching}
          enablePagination={true}
          columns={columns}
          properties={properties}
          actions={actions}
          totalPages={queries.enrollments.totalPages}
        />
      </section>

      {/* Panel to enroll a new student to academic cycle */}
      {
        isActiveEnrollmentPanel && (
          <AcademicCycleEnrollmentPanelForm
            title={academicCycleSchoolGroupEnrollment ? `Incripción - ${academicCycleSchoolGroupEnrollment.student?.enrollment}` : "Nueva inscripción"}
            open={isActiveEnrollmentPanel}
            academicCycleSchoolGroups={queries.schoolGroups.data}
            academicCycleSchoolGroupEnrollment={academicCycleSchoolGroupEnrollment}
            handleClickClose={() => setIsActiveEnrollmentPanel(false)}
            onSubmit={onSubmit}
          />
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
