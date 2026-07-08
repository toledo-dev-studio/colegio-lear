import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { EmployeeForm } from "./components/EmployeeForm";
import { Loader } from "@/shared/components/loader/Loader";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import type { EmployeeRequest } from "@/interfaces/requests/employee.request";
import { useGetEmployeeById } from "../../hooks/employees/useGetEmployeeById";
import { useCreateUpdateEmployee } from "../../hooks/employees/useCreateUpdateEmployee";

export const EmployeePage = () => {
  // Component hooks & stores
  const { id } = useParams();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useLoaderStore();
  const employeeQuery = useGetEmployeeById({ id: id! });
  const createUpdateEmployeeMutation = useCreateUpdateEmployee();
  const title = id === "new" ? "Registro de empleado" : "Edición de empleado";

  const handleSubmit = async (employeeRequestLike: Partial<EmployeeRequest>) => {
    try {
      showLoading("Guardando registro");
      await createUpdateEmployeeMutation.mutateAsync({ id: id!, employeeRequestLike }, {
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
          <Loader title="Cargando información" subtitle="Por favor espere..." />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="w-full py-12 px-10 lg:px-15">

        <div className="mb-10">
          <Breadcrumb items={[
            { label: "Seguridad" },
            { label: "Empleados", to: "/employees" },
            { label: id === "new" ? "Nuevo empleado" : employeeQuery.data?.name || "Edición de empleado" },
          ]} />
        </div>

        <PageTitle
          title={title}
          subtitle="Gestiona la información de los empleados que estará disponible en la organización" />

        <div className="flex-1">
          <section className="flex flex-col min-h-full gap-8 mt-14">
            <EmployeeForm
              employeeResponse={employeeQuery.data}
              isSubmitting={createUpdateEmployeeMutation.isPending}
              onSubmit={handleSubmit}
            />
          </section>
        </div>
      </div>
    </>
  )
}
