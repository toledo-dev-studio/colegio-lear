import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { useEmployee } from "../../hooks/useEmployee";
import { EmployeeForm } from "./components/EmployeeForm";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import type { EmployeeFormData } from "../../interfaces/employee-form";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";

export const EmployeePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const title = id === "new" ? 'Registro de empleado' : 'Edición de empleado';
  const { isLoading, isError, data: employee, mutation } = useEmployee(id || '');
  const { showLoading, hideLoading } = useLoaderStore();

  const handleSubmit = async (employeeLike: Partial<EmployeeFormData>) => {
    try {
      showLoading('Guardando registro');
      await mutation.mutateAsync(employeeLike, {
        onSuccess: (response) => {
          toast.success('Empleado actualizada correctamente');
          hideLoading();
          navigate(`/employees/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error('Ocurrio un error al tratar de actualizar el empleado');
    }
  }

  if (isError) {
    toast.error("No fue posible obtener la información del empleado");
    return <Navigate to="/employees" />;
  }

  if (isLoading) {
    return (
      <>
        <div className="w-full relative mx-auto h-full mt-30">
          <CustomFullScreenLoading title="Cargando información" subtitle="Por favor espere..." />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="w-full py-12 px-10 lg:px-15">
        <CustomPageTitle
          title={title}
          subtitle="Gestiona la información de los empleados que estará disponible en la organización" />

        <div className="flex-1">
          <div className="flex flex-col min-h-full gap-8 mt-14">

            <EmployeeForm
              employee={employee}
              isSubmitting={mutation.isPending}
              onSubmit={handleSubmit}
            />

          </div>
        </div>
      </div>
    </>
  )
}
