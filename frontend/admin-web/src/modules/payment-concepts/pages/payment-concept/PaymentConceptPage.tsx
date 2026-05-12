import { toast } from "sonner";
import { Navigate, useNavigate, useParams } from "react-router";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { usePaymentConcept } from "../../hooks/usePaymentConcept";
import { PaymentConceptForm } from "./components/PaymentConceptForm";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import type { PaymentConcept } from "@/interfaces/entites/payment-concept";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";

export const PaymentConceptPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const title = id === "new" ? 'Registro de concepto de pago' : 'Edición de concepto de pago';
  const { isLoading, isError, data: paymentConcept, mutation } = usePaymentConcept(id || '');
  const { showLoading, hideLoading } = useLoaderStore();

  const handleSubmit = async (paymentConceptLike: Partial<PaymentConcept>) => {
    console.log(paymentConceptLike);
    
    try {
      showLoading('Guardando registro');
      !paymentConceptLike.id && (paymentConceptLike.id = "new");

      await mutation.mutateAsync(paymentConceptLike, {
        onSuccess: (response) => {
          toast.success('Registro actualizado de forma exitosa');
          navigate(`/payment-concepts/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error('Ocurrio un error al tratar de actualizar el registro seleccionado');
    }
  }

  if (isError) {
    toast.error("No fue posible obtener la información del registro seleccionado");
    return <Navigate to="/payment-concepts" />;
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
          subtitle="Gestiona la información de los conceptos de pago que estará disponible en el colegio" />

        <div className="flex-1">
          <div className="flex flex-col min-h-full gap-8 mt-14">

            <PaymentConceptForm
              paymentConcept={paymentConcept}
              isSubmitting={mutation.isPending}
              onSubmit={handleSubmit}
            />

          </div>
        </div>
      </div>

    </>
  )
}
