import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { PaymentConceptForm } from "./components/PaymentConceptForm";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { useGetPaymentConceptById } from "../../hooks/useGetPaymentConceptById";
import { PaymentConceptSkeletonForm } from "./components/PaymentConceptSkeletonForm";
import { useCreateUpdatePaymentConcept } from "../../hooks/useCreateUpdatePaymentConcept";
import type { PaymentConceptRequest } from "@/interfaces/requests/payment-concept.request";

export const PaymentConceptPage = () => {
  // Component hooks & stores
  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading } = useLoaderStore();
  const paymentConceptQuery = useGetPaymentConceptById({ id: id! });
  const createUpdatePaymentConceptMutation = useCreateUpdatePaymentConcept();
  const title = id === "new" ? "Registro de concepto de pago" : "Edición de concepto de pago";

  const handleSubmit = async (paymentConceptRequestLike: Partial<PaymentConceptRequest>) => {
    try {
      showLoading("Guardando registro");
      await createUpdatePaymentConceptMutation.mutateAsync({ id: id!, paymentConceptRequestLike }, {
        onSuccess: (response) => {
          toast.success("Registro actualizado de forma exitosa", { position: "top-right" });
          hideLoading();
          navigate(`/payment-concepts/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error("Ocurrio un error al tratar de actualizar el registro seleccionado", { position: "top-right" });
    }
  }

  if (paymentConceptQuery.isError) {
    toast.error("No fue posible obtener la información del registro seleccionado", { position: "top-right" });
    return <Navigate to="/payment-concepts" />;
  }

  return (
    <>
      <div className="w-full py-12 px-10 lg:px-15">

        <div className="mb-10">
          <Breadcrumb items={[
            { label: "Configuración escolar" },
            { label: "Conceptos de pago", to: "/payment-concepts" },
            { label: id === "new" ? "Nuevo concepto de pago" : paymentConceptQuery.data?.name || "Edición de concepto de pago" },
          ]} />
        </div>

        <PageTitle
          title={title}
          subtitle="Gestiona la información de los conceptos de pago que estará disponible en el colegio" />

        <div className="flex-1">
          <section className="flex flex-col min-h-full gap-8 mt-5">
            {
              paymentConceptQuery.isLoading ?
                <PaymentConceptSkeletonForm /> :
                <PaymentConceptForm
                  paymentConceptResponse={paymentConceptQuery.data}
                  isSubmitting={createUpdatePaymentConceptMutation.isPending}
                  onSubmit={handleSubmit}
                />
            }
          </section>
        </div>
      </div>

    </>
  )
}
