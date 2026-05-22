import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { ScholarshipForm } from "./components/ScholarshipForm";
import type { Scholarship } from "@/interfaces/entites/scholarship";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import { CustomBreadcrumb } from "@/shared/components/CustomBreadcrumb";
import { useGetByIdScholarship } from "../../hooks/useGetByIdScholarship";
import { useCreateUpdateScholarship } from "../../hooks/useCreateUpdateScholarship";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";

export const ScholarshipPage = () => {

  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading } = useLoaderStore();
  const scholarshipQuery = useGetByIdScholarship(id || "");
  const createUpdateScholarshipMutation = useCreateUpdateScholarship();
  const title = id === "new" ? 'Registro de beca escolar' : 'Edición de beca escolar';

  const handleSubmit = async (scholarshipLike: Partial<Scholarship>) => {
    try {
      showLoading('Guardando registro');
      await createUpdateScholarshipMutation.mutateAsync(scholarshipLike, {
        onSuccess: (response) => {
          toast.success('Beca escolar actualizada correctamente', { position: "top-right" });
          hideLoading();
          navigate(`/scholarships/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error('Ocurrio un error al tratar de actualizar la beca escolar', { position: "top-right" });
    }
  }

  if (scholarshipQuery.isError) {
    toast.error("No fue posible obtener la información de la beca escolar", { position: "top-right" });
    return <Navigate to="/scholarships" />;
  }

  if (scholarshipQuery.isLoading) {
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
            { label: "Becas escolares", to: "/scholarships" },
            { label: id === "new" ? "Nueva beca escolar" : scholarshipQuery.data?.name || "Edición de beca escolar" },
          ]} />
        </div>

        <CustomPageTitle
          title={title}
          subtitle="Getiona la información de la beca escolar que estará disponible en el colegio" />

        <div className="flex-1">
          <div className="flex flex-col min-h-full gap-8 mt-14">

            <ScholarshipForm
              scholarship={scholarshipQuery.data}
              isSubmitting={createUpdateScholarshipMutation.isPending}
              onSubmit={handleSubmit}
            />

          </div>
        </div>
      </div>

    </>
  )
}
