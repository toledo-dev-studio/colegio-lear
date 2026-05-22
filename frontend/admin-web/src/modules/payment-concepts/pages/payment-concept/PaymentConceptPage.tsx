import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { PaymentConceptForm } from "./components/PaymentConceptForm";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import type { PaymentConcept } from "@/interfaces/entites/payment-concept";
import { useGetByIdPaymentConcept } from "../../hooks/useGetByIdPaymentConcept";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useCreateUpdatePaymentConcept } from "../../hooks/useCreateUpdatePaymentConcept";
import { CustomBreadcrumb } from "@/shared/components/CustomBreadcrumb";

export const PaymentConceptPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading } = useLoaderStore();
  const paymentConceptQuery = useGetByIdPaymentConcept(id || "");
  const createUpdatePaymentConceptMutation = useCreateUpdatePaymentConcept();
  const title = id === "new" ? 'Registro de concepto de pago' : 'Edición de concepto de pago';

  const handleSubmit = async (paymentConceptLike: Partial<PaymentConcept>) => {
    try {
      showLoading('Guardando registro');
      await createUpdatePaymentConceptMutation.mutateAsync(paymentConceptLike, {
        onSuccess: (response) => {
          toast.success('Registro actualizado de forma exitosa', { position: "top-right" });
          hideLoading();
          navigate(`/payment-concepts/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error('Ocurrio un error al tratar de actualizar el registro seleccionado', { position: "top-right" });
    }
  }

  if (paymentConceptQuery.isError) {
    toast.error("No fue posible obtener la información del registro seleccionado", { position: "top-right" });
    return <Navigate to="/payment-concepts" />;
  }

  if (paymentConceptQuery.isLoading) {
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
            { label: "Configuración escolar" },
            { label: "Conceptos de pago", to: "/payment-concepts" },
            { label: id === "new" ? "Nuevo concepto de pago" : paymentConceptQuery.data?.name || "Edición de concepto de pago" },
          ]} />
        </div>

        <CustomPageTitle
          title={title}
          subtitle="Gestiona la información de los conceptos de pago que estará disponible en el colegio" />

        <div className="flex-1">
          <div className="flex flex-col min-h-full gap-8 mt-14">

            <PaymentConceptForm
              paymentConcept={paymentConceptQuery.data}
              isSubmitting={createUpdatePaymentConceptMutation.isPending}
              onSubmit={handleSubmit}
            />

          </div>
        </div>
      </div>

    </>
  )
}
