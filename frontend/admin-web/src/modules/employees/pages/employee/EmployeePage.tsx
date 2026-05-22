import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { EmployeeForm } from "./components/EmployeeForm";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import type { EmployeeFormData } from "../../interfaces/employee-form";
import { useGetByIdEmployee } from "../../hooks/employees/useGetByIdEmployee";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useCreateUpdateEmployee } from "../../hooks/employees/useCreateUpdateEmployee";
import { CustomBreadcrumb } from "@/shared/components/CustomBreadcrumb";

export const EmployeePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading } = useLoaderStore();
  const employeeQuery = useGetByIdEmployee(id || "");
  const createUpdateEmployeeMutation = useCreateUpdateEmployee();
  const title = id === "new" ? "Registro de empleado" : "Edición de empleado";

  const handleSubmit = async (employeeLike: Partial<EmployeeFormData>) => {
    try {
      showLoading("Guardando registro");
      await createUpdateEmployeeMutation.mutateAsync(employeeLike, {
        onSuccess: (response) => {
          toast.success("Empleado actualizada correctamente", { position: "top-right" });
          hideLoading();
          navigate(`/employees/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error("Ocurrio un error al tratar de actualizar el empleado", { position: "top-right" });
    }
  }

  if (employeeQuery.isError) {
    toast.error("No fue posible obtener la información del empleado", { position: "top-right" });
    return <Navigate to="/employees" />;
  }

  if (employeeQuery.isLoading) {
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

        <div className="mb-10">
          <CustomBreadcrumb items={[
            { label: "Seguridad" },
            { label: "Empleados", to: "/employees" },
            { label: id === "new" ? "Nuevo empleado" : employeeQuery.data?.name || "Edición de empleado" },
          ]} />
        </div>

        <CustomPageTitle
          title={title}
          subtitle="Gestiona la información de los empleados que estará disponible en la organización" />

        <div className="flex-1">
          <div className="flex flex-col min-h-full gap-8 mt-14">

            <EmployeeForm
              employee={employeeQuery.data}
              isSubmitting={createUpdateEmployeeMutation.isPending}
              onSubmit={handleSubmit}
            />

          </div>
        </div>
      </div>
    </>
  )
}
