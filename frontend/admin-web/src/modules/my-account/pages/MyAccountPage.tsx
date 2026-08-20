import { toast } from "sonner";

import { MyAccountForm } from "./components/MyAccountForm";
import { useLoaderStore } from "@/stores/LoaderStore";
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { useUpdateMyAccount } from "../hooks/useUpdateMyAccount";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import type { EmployeeRequest } from "@/interfaces/requests/employee.request";
import { userStoreFullName } from "@/modules/auth/stores/auth.store.selectors";

export const MyAccountPage = () => {

  const { showLoading, hideLoading } = useLoaderStore();

  const updateMyAccountMutation = useUpdateMyAccount();

  const { user: employee, setUser: setEmployee } = useAuthStore();
  const loggedInUserFullName = useAuthStore(userStoreFullName);

  const handleSubmit = async (employeeRequestLike: Partial<EmployeeRequest>) => {
    try {
      showLoading("Actualizando información de la cuenta");
      await updateMyAccountMutation.mutateAsync({ employeeRequestLike }, {
        onSuccess: (response) => {
          setEmployee({ ...response });
          toast.success("Información de la cuenta actualizada correctamente", { position: "top-right" });
          hideLoading();
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error("Ocurrio un error al tratar de actualizar la información de su cuenta", { position: "top-right" });
    }
  }

  return (
    <>
      <section className="page-main-section">

        <Breadcrumb items={[
          { label: "Accesos rápidos" },
          { label: "Mi cuenta", to: "/my-account" },
        ]} />

        <PageTitle
          title={loggedInUserFullName || "Mi cuenta"}
          subtitle="Gestiona la información de tu cuenta y consulta información detallada" />

        <div className="flex-1">
          <MyAccountForm
            employeeResponse={employee!}
            onSubmit={handleSubmit}
            isSubmitting={false} />
        </div>
      </section>
    </>
  )
}
