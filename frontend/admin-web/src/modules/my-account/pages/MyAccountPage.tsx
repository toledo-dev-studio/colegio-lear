import { toast } from "sonner";

import { MyAccountForm } from "./components/MyAccountForm";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { useUpdateMyAccount } from "../hooks/useUpdateMyAccount";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import { CustomBreadcrumb } from "@/shared/components/CustomBreadcrumb";
import { userStoreFullName } from "@/modules/auth/stores/auth.store.selectors";
import type { EmployeeFormData } from "@/modules/employees/interfaces/employee-form";

export const MyAccountPage = () => {

  const { showLoading, hideLoading } = useLoaderStore();

  const updateMyAccountMutation = useUpdateMyAccount();

  const { user: employee, setUser: setEmployee } = useAuthStore();
  const loggedInUserFullName = useAuthStore(userStoreFullName);
  
  const handleSubmit = async (employeeLike: Partial<EmployeeFormData>) => {
    try {
      showLoading("Actualizando información de la cuenta");
      await updateMyAccountMutation.mutateAsync(employeeLike, {
        onSuccess: (response) => {
          setEmployee(response);
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
      <div className="w-full py-12 px-10 lg:px-15">

        <div className="mb-10">
          <CustomBreadcrumb items={[
            { label: "Accesos rápidos" },
            { label: "Mi cuenta", to: "/my-account" },
          ]} />
        </div>

        <CustomPageTitle
          title={loggedInUserFullName || "Mi cuenta"}
          subtitle="Gestiona la información de tu cuenta y consulta información detallada" />

        <div className="flex-1">
          <MyAccountForm
            employee={employee!}
            onSubmit={handleSubmit}
            isSubmitting={false} />
        </div>
      </div>
    </>
  )
}
