import { useNavigate } from "react-router";
import { toast } from "sonner";
import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { useEmployeesPage } from "./hooks/useEmployeesPage";
import { downloadDataToCsvFile, type CsvHeader } from "@/lib/extensions/csv";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { useEmployeesPageTable } from "./hooks/useEmployeesPageTable";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { EmployeesAdvancedFilters } from "./components/EmployeesAdvancedFilters";
import { usePermission } from "@/modules/auth/hooks/usePermission";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";

export const EmployeesPage = () => {
  // Component hooks & stores
  const navigate = useNavigate();
  const canWrite = usePermission("employees", "can-write");
  const { loader, advancedFilters, deleteModal, queries, mutations } = useEmployeesPage();
  const { columns, properties, actions } = useEmployeesPageTable({ handleClickDelete: deleteModal.open });

  // Component functions
  const handleClickExport = async () => {
    loader.show("Descargando información", "Por favor espere...");

    const data = await mutations.employees.export.mutateAsync();

    if (!data || !Array.isArray(data)) {
      loader.hide();
      toast.info("No se cuenta con información para descargar", { position: "top-right" });
      return;
    }

    const headers: CsvHeader<EmployeeResponse>[] = [
      { label: "Identificador", key: "id" },
      { label: "Nombre", key: "name" },
      { label: "Apelldo paterno", key: "firstLastName" },
      { label: "Apellido materno", key: "secondLastName" },
      { label: "Correo electrónico", key: "email" },
      { label: "Número de teléfono", key: "phoneNumber" },
      { label: "Usuario del sistema", key: "username" },
      { label: "¿Registro activo?", key: "isActive", render: (item) => item.isActive ? "Activo" : "Inactivo" },
      { label: "Rol asignado", key: "securityRole", render: (item) => item.securityRole?.name ?? "Sin rol asignado" },
      { label: "Puesto de trabajo asignado", key: "jobTitle", render: (item) => item.jobTitle?.name ?? "Sin puesto de trabajo asignado" },
    ];

    downloadDataToCsvFile("Empleados", headers, data);

    setTimeout(() => loader.hide(), 500);
  }

  const handleClickConfirmDeleteEmployee = async () => {
    if (!deleteModal.record)
      return;
    await mutations.employees.delete.mutateAsync({ id: deleteModal.record?.id! },
      {
        onSuccess: () => {
          toast.success("Empleado eliminada correctamente", { position: "top-right" });
          deleteModal.close();
        },
        onError: (error: any) => {
          console.warn(error);
          showApiErrorToast(error, "Ocurrio un error al tratar de eliminar el empleado");
        }
      }
    );
  }

  if (queries.employees.paged.isError) {
    showApiErrorToast(queries.employees.paged.error, "No fue posible obtener información de los empleados");
  }

  return (
    <>
      <section className="page-main-section">

        <Breadcrumb items={[
          { label: "Seguridad" },
          { label: "Empleados", to: "/employees" }
        ]} />

        <PageTitle title="Empleados del sistema" subtitle="Gestiona los empleados que estarán disponibles en la organización" />

        {/* Table ribbon options */}
        <TableRibbon
          addButton={{ show: canWrite, handleClick: () => navigate("/employees/new") }}
          filterButton={{ handleClick: advancedFilters.open }}
          exportButton={{ handleClick: handleClickExport }}
          searchInput={{ tooltip: "Búsqueda general por nombre, email & usuario", placeholder: "Búsqueda general por nombre, email & usuario" }}
        />

        {/* Table content*/}
        <Table
          data={queries.employees.paged.data}
          isLoading={queries.employees.paged.isFetching}
          enablePagination={true}
          columns={columns}
          properties={properties}
          actions={actions}
          totalPages={queries.employees.paged.totalPages}
        />

        {/* Delete single record modal */}
        {
          (deleteModal.isOpen && deleteModal.record) && (
            <Modal
              open={deleteModal.isOpen}
              type="delete"
              title={`¿Estas seguro de eliminar el registro "${deleteModal.record.name}"?`}
              message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
              isLoading={mutations.employees.delete.isPending}
              cancelButton={{
                label: "Cancelar",
                onClick: () => deleteModal.close()
              }}
              confirmButton={{
                label: "Sí, eliminar",
                onClick: handleClickConfirmDeleteEmployee
              }}
            />
          )
        }

        {/* Advanced filters panel */}
        {
          advancedFilters.isOpen && (
            <EmployeesAdvancedFilters
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
