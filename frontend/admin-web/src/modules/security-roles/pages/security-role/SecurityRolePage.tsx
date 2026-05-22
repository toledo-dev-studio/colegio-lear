import { Navigate, useNavigate, useParams } from "react-router"
import { toast } from "sonner";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { SecurityRoleForm } from "./components/SecurityRoleForm";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import type { SecurityRole } from "@/interfaces/entites/security-role";
import { CustomBreadcrumb } from "@/shared/components/CustomBreadcrumb";
import { useGetByIdSecurityRole } from "../../hooks/useGetByIdSecurityRole";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useCreateUpdateSecurityRole } from "../../hooks/useCreateUpdateSecurityRole";

export const SecurityRolePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading } = useLoaderStore();
  const securityRoleQuery = useGetByIdSecurityRole(id || "");
  const createUpdateSecurityRoleMutation = useCreateUpdateSecurityRole();
  const title = id === "new" ? 'Registro de nuevo rol de seguridad' : 'Edición de rol de seguridad';

  const handleSubmit = async (securityRoleLike: Partial<SecurityRole>) => {
    try {
      showLoading('Guardando registro');
      await createUpdateSecurityRoleMutation.mutateAsync(securityRoleLike, {
        onSuccess: (response) => {
          toast.success('El registro se ah actualizado correctamente', { position: "top-right" });
          hideLoading();
          navigate(`/security-roles/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error('Ocurrio un error al tratar de actualizar el registro', { position: "top-right" });
    }
  }

  if (securityRoleQuery.isError) {
    toast.error("No fue posible obtener la información del registro seleccionado", { position: "top-right" });
    return <Navigate to="/security-roles" />;
  }

  if (securityRoleQuery.isLoading) {
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
            { label: "Roles de seguridad", to: "/security-roles" },
            { label: id === "new" ? "Nuevo rol de seguridad" : securityRoleQuery.data?.name || "Edición de rol de seguridad" },
          ]} />
        </div>

        <CustomPageTitle
          title={title}
          subtitle="Getiona la información del rol de seguridad para estar dispoible en la organiación" />

        <div className="flex-1">
          <div className="flex flex-col min-h-full gap-8 mt-14">

            <SecurityRoleForm
              securityRole={securityRoleQuery.data}
              isSubmitting={createUpdateSecurityRoleMutation.isPending}
              onSubmit={handleSubmit}
            />

          </div>
        </div>
      </div>

    </>
  )
}
