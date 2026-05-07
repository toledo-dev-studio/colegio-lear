import { Navigate, useNavigate, useParams } from "react-router"
import { toast } from "sonner";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useSecurityRole } from "../../hooks/useSecurityRole";
import { SecurityRoleForm } from "./components/SecurityRoleForm";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import type { SecurityRole } from "@/interfaces/entites/security-role";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";

export const SecurityRolePage = () => {

  const navigate = useNavigate();
  const { id } = useParams();

  const title = id === "new" ? 'Registro de nuevo rol de seguridad' : 'Edición de rol de seguridad';
  const { isLoading, isError, data: securityRole, mutation } = useSecurityRole(id || '');
  const { showLoading, hideLoading } = useLoaderStore();

  const handleSubmit = async (securityRoleLike: Partial<SecurityRole>) => {
    try {
      showLoading('Guardando registro');
      !securityRoleLike.id && (securityRoleLike.id = "new");

      await mutation.mutateAsync(securityRoleLike, {
        onSuccess: (response) => {
          toast.success('El registro se ah actualizado correctamente');
          navigate(`/security-roles/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error('Ocurrio un error al tratar de actualizar el registro');
    }
  }

  if (isError) {
    toast.error("No fue posible obtener la información del registro seleccionado");
    return <Navigate to="/security-roles" />;
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
          subtitle="Getiona la información del rol de seguridad para estar dispoible en la organiación" />

        <div className="flex-1">
          <div className="flex flex-col min-h-full gap-8 mt-14">

            <SecurityRoleForm
              securityRole={securityRole}
              isSubmitting={mutation.isPending}
              onSubmit={handleSubmit}
            />

          </div>
        </div>
      </div>

    </>
  )
}
