import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";

import { useLoaderStore } from "@/stores/LoaderStore";
import { ScholarshipForm } from "./components/ScholarshipForm";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { useGetScholarshipById } from "../../hooks/useGetScholarshipById";
import { ScholarshipFormSkeleton } from "./components/ScholarshipFormSkeleton";
import { useCreateUpdateScholarship } from "../../hooks/useCreateUpdateScholarship";
import type { ScholarshipRequest } from "@/interfaces/requests/scholarship.request";

export const ScholarshipPage = () => {

  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading } = useLoaderStore();
  const scholarshipQuery = useGetScholarshipById({ id: id! });
  const createUpdateScholarshipMutation = useCreateUpdateScholarship();
  const title = id === "new" ? "Registro de beca escolar" : "Edición de beca escolar";

  const handleSubmit = async (scholarshipRequestLike: Partial<ScholarshipRequest>) => {
    try {
      showLoading("Guardando registro");
      await createUpdateScholarshipMutation.mutateAsync({ id: id!, scholarshipRequestLike }, {
        onSuccess: (response) => {
          toast.success("Beca escolar actualizada correctamente", { position: "top-right" });
          hideLoading();
          navigate(`/scholarships/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      showApiErrorToast(error, "Ocurrio un error al tratar de actualizar la beca escolar");
    }
  }

  if (scholarshipQuery.isError) {
    showApiErrorToast(scholarshipQuery.error, "No fue posible obtener la información de la beca escolar");
    return <Navigate to="/scholarships" />;
  }

  return (
    <>
      <div className="w-full py-12 px-10 lg:px-15">

        <div className="mb-10">
          <Breadcrumb items={[
            { label: "Configuración escolar" },
            { label: "Becas escolares", to: "/scholarships" },
            { label: id === "new" ? "Nueva beca escolar" : scholarshipQuery.data?.name || "Edición de beca escolar" },
          ]} />
        </div>

        <PageTitle
          title={title}
          subtitle="Getiona la información de la beca escolar que estará disponible en el colegio" />

        <div className="flex-1">
          <div className="flex flex-col min-h-full gap-8 mt-5">

            {
              scholarshipQuery.isLoading ?
                <ScholarshipFormSkeleton /> :
                <ScholarshipForm
                  scholarshipResponse={scholarshipQuery.data}
                  isSubmitting={createUpdateScholarshipMutation.isPending}
                  onSubmit={handleSubmit}
                />
            }

          </div>
        </div>
      </div>

    </>
  )
}
