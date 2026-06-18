import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Table } from "@/shared/components/table/Table";
import { Modal } from "@/shared/components/modal/Modal";
import { useEmployeesPage } from "./hooks/useEmployeesPage";
import { downloadDataToCsvFile } from "@/lib/extensions/csv";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { useEmployeesPageTable } from "./hooks/useEmployeesPageTable";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { TableRibbon } from "@/shared/components/table-ribbon/TableRibbon";
import { EmployeesAdvancedFilters } from "./components/EmployeesAdvancedFilters";

export const EmployeesPage = () => {
  // Component hooks & stores
  const navigate = useNavigate();
  const { loader, advancedFilters, deleteModal, queries, mutations } = useEmployeesPage();
  const { columns, properties, actions } = useEmployeesPageTable({ handleClickDelete: deleteModal.open });

  // Component functions
  const handleClickExport = async () => {
    loader.show("Descargando información", "Por favor espere...");

    const data = await mutations.employees.export.mutateAsync();

    if (!data || !Array.isArray(data)) {
      loader.hide();
      toast.info('No se cuenta con información para descargar', { position: "top-right" });
      return;
    }

    const headers = [
      { label: 'Id', key: 'id' },
      { label: 'Nombre', key: 'name' },
      { label: 'Apelldo paterno', key: 'firstLastName' },
      { label: 'Apellido materno', key: 'secondLastName' },
      { label: 'Correo electrónico', key: 'email' },
      { label: 'Usuario del sistema', key: 'username' },
      { label: 'Estado', key: 'status' },
      { label: 'Rol asignado', key: 'role.name' }
    ];

    downloadDataToCsvFile('Empleados', headers, data);

    setTimeout(() => loader.hide(), 500);
  }

  const handleClickConfirmDeleteEmployee = async () => {
    if (!deleteModal.record)
      return;
    await mutations.employees.delete.mutateAsync({ id: deleteModal.record?.id! },
      {
        onSuccess: () => {
          toast.success('Empleado eliminada correctamente', { position: "top-right" });
          deleteModal.close();
        },
        onError: (error: any) => {
          console.warn(error);
          toast.error('Ocurrio un error al tratar de eliminar el empleado', { position: "top-right" });
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
            { label: "Empleados", to: "/employees" }
          ]} />
        </div>

        <PageTitle title="Empleados del sistema" subtitle="Gestiona los empleados que estarán disponibles en la organización" />

        <section className="flex flex-col gap-8 mt-14">

          {/* Table ribbon options */}
          <TableRibbon
            handleClickAdvancedFilters={() => advancedFilters.open()}
            handleClickAdd={() => navigate("/employees/new")}
            handleClickExport={handleClickExport}
            inputSearchTooltip="Búsqueda general por nombre, email & usuario"
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

      </div>
    </>
  )
}
