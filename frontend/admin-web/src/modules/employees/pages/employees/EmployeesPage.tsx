import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { EmployeesTable } from "./components/EmployeesTable"
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { downloadDataToCsvFile } from "@/lib/extensions/csv";
import type { Employee } from "@/interfaces/entites/employee";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import { CustomPagination } from "@/shared/components/CustomPagination";
import { CustomDeleteModal } from "@/shared/components/CustomDeleteModal";
import { useDeleteEmployee } from "../../hooks/employees/useDeleteEmployee";
import { useExportEmployees } from "../../hooks/employees/useExportEmployees";
import { EmployeesAdvancedFilters } from "./components/EmployeesAdvancedFilters";
import { useGetPagedEmployees } from "../../hooks/employees/useGetPagedEmployees";
import { CustomTableListRibbon } from "@/shared/components/CustomTableListRibbon";

export const EmployeesPage = () => {

  const navigate = useNavigate();

  const [isOpenSingleDeleteModal, setIsOpenSingleDeleteModal] = useState<boolean>(false);
  const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | undefined>(undefined);
  
  const { showLoading, hideLoading } = useLoaderStore();

  const pagedEmployeesQuery = useGetPagedEmployees();
  const deleteEmployeeMutation = useDeleteEmployee();
  const exportEmployeesMutation = useExportEmployees();
  
  const handleClickAdd = () => {
    navigate('/employees/new');
  }

  const handleClickExport = async () => {
    showLoading('Descargando información', 'Por favor espere...');

    const data = await exportEmployeesMutation.mutateAsync();

    if (!data || !Array.isArray(data)) {
      hideLoading();
      toast.info('No se cuenta con información para descargar');
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

    setTimeout(() => hideLoading(), 500);
  }

  const handleClickAdvancedFilters = () => {
    setIsOpenAdvancedFiltersPanel(true);
  }

  const handleClickEditRow = (employee: Employee) => {
    navigate(`/employees/${employee.id}`);
  }

  const handleClickDeleteRow = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setIsOpenSingleDeleteModal(true);
  }

  const handleClickCancelDelteEmployee = () => {
    setEmployeeToDelete(undefined);
    setIsOpenSingleDeleteModal(false);
  }

  const handleClickDelteEmployee = async () => {
    await deleteEmployeeMutation.mutateAsync({ id: employeeToDelete?.id! },
      {
        onSuccess: () => {
          toast.success('Empleado eliminada correctamente');
          setEmployeeToDelete(undefined);
          setIsOpenSingleDeleteModal(false);
        },
        onError: (error: any) => {
          console.warn(error);
          toast.error('Ocurrio un error al tratar de eliminar el empleado');
        }
      }
    );
  }

  const handleClickCloseAdvancedFiltersPanel = () => {
    setIsOpenAdvancedFiltersPanel(false);
  }

  return (
    <>
      <div className="w-full py-12 px-10 lg:px-15">

        <CustomPageTitle title="Empleados del sistema" subtitle="Gestiona los empleados que estarán disponibles en la organización" />

        <div className="flex flex-col gap-8 mt-14">

          {/* Table ribbon options */}
          <CustomTableListRibbon
            handleClickAdvancedFilters={handleClickAdvancedFilters}
            handleClickAdd={handleClickAdd}
            handleClickExport={handleClickExport}
            disabledExport={exportEmployeesMutation.isPending}
          />

          {/* Table content*/}
          <EmployeesTable
            data={pagedEmployeesQuery.data?.data ?? []}
            isLoading={pagedEmployeesQuery.isLoading}
            handleClickEditRow={handleClickEditRow}
            handleClickDeleteRow={handleClickDeleteRow}
          />

          {/* Pagination top element */}
          {
            (!pagedEmployeesQuery.isLoading && pagedEmployeesQuery.data?.data.length) && (
              <div className="flex items-center justify-center my-8">
                <CustomPagination totalPages={pagedEmployeesQuery.data?.totalPages ?? 0} />
              </div>
            )
          }

          {
            employeeToDelete && (
              <CustomDeleteModal
                open={isOpenSingleDeleteModal}
                title={`¿Estas seguro de eliminar el registro ${employeeToDelete.email}`}
                message={"El registro se eliminará del sistema y solo el administrador del sistema podrán recuperarlo"}
                isLoading={deleteEmployeeMutation.isPending}
                handleClickConfirm={handleClickDelteEmployee}
                handleClickCancel={handleClickCancelDelteEmployee}
              />
            )
          }


          {
            isOpenAdvancedFiltersPanel && (
              <EmployeesAdvancedFilters
                open={isOpenAdvancedFiltersPanel}
                title="Filtros avanzados"
                handleClickClose={handleClickCloseAdvancedFiltersPanel}
              />
            )
          }

        </div>

      </div>
    </>
  )
}
