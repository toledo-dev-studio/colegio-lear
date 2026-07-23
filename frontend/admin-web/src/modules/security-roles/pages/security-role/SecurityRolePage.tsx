import { Navigate, useNavigate, useParams } from "react-router"
import { toast } from "sonner";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { SecurityRoleForm } from "./components/SecurityRoleForm";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { useGetSecurityRoleById } from "../../hooks/useGetSecurityRoleById";
import { useCreateUpdateSecurityRole } from "../../hooks/useCreateUpdateSecurityRole";
import type { SecurityRoleRequest } from "@/interfaces/requests/security-role.request";
import { Loader } from "@/shared/components/loader/Loader";

export const SecurityRolePage = () => {
  // Hooks & stores
  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading } = useLoaderStore();
  const securityRoleQuery = useGetSecurityRoleById({ id: id! });
  const createUpdateSecurityRoleMutation = useCreateUpdateSecurityRole();
  const title = id === "new" ? "Registro de nuevo rol de seguridad" : "Edición de rol de seguridad";

  // Component functions
  const handleSubmit = async (securityRoleRequestLike: Partial<SecurityRoleRequest>) => {
    try {
      showLoading("Guardando registro");
      await createUpdateSecurityRoleMutation.mutateAsync({ id: id!, securityRoleRequestLike }, {
        onSuccess: (response) => {
          toast.success("El registro se ah actualizado correctamente", { position: "top-right" });
          hideLoading();
          navigate(`/security-roles/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error("Ocurrio un error al tratar de actualizar el registro", { position: "top-right" });
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
          <Loader title="Cargando información" subtitle="Por favor espere..." />
        </div>
      </>
    )
  }

  return (
    <>
      <section className="w-full py-12 px-10 lg:px-15">

        <div className="mb-10">
          <Breadcrumb items={
            [
              { label: "Seguridad" },
              { label: "Roles de seguridad", to: "/security-roles" },
              { label: id === "new" ? "Nuevo rol de seguridad" : securityRoleQuery.data?.name || "Edición de rol de seguridad" },
            ]
          } />
        </div>

        <PageTitle
          title={title}
          subtitle="Getiona la información del rol de seguridad para estar dispoible en la organiación" />

        <div className="flex-1">
          <section className="flex flex-col min-h-full gap-8 mt-5">
            <SecurityRoleForm
              securityRoleResponse={securityRoleQuery.data}
              isSubmitting={createUpdateSecurityRoleMutation.isPending}
              onSubmit={handleSubmit}
            />
          </section>
        </div>

      </section>

    </>
  )
}
