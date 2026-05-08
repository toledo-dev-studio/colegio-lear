import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { useScholarship } from "../../hooks/useScholarship";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import type { Scholarship } from "@/interfaces/entites/scholarship";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import { ScholarshipForm } from "./components/ScholarshipForm";

export const ScholarshipPage = () => {

  const navigate = useNavigate();
  const { id } = useParams();

  const title = id === "new" ? 'Registro de beca escolar' : 'Edición de beca escolar';
  const { isLoading, isError, data: scholarship, mutation } = useScholarship(id || '');
  const { showLoading, hideLoading } = useLoaderStore();

  const handleSubmit = async (scholarshipLike: Partial<Scholarship>) => {
    try {
      showLoading('Guardando registro');
      !scholarshipLike.id && (scholarshipLike.id = "new");

      await mutation.mutateAsync(scholarshipLike, {
        onSuccess: (response) => {
          toast.success('Beca escolar actualizada correctamente');
          navigate(`/scholarships/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error('Ocurrio un error al tratar de actualizar la beca escolar');
    }
  }

  if (isError) {
    toast.error("No fue posible obtener la información de la beca escolar");
    return <Navigate to="/scholarships" />;
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
          subtitle="Getiona la información de la beca escolar que estará disponible en el colegio" />

        <div className="flex-1">
          <div className="flex flex-col min-h-full gap-8 mt-14">

            <ScholarshipForm
              scholarship={scholarship}
              isSubmitting={mutation.isPending}
              onSubmit={handleSubmit}
            />

          </div>
        </div>
      </div>

    </>
  )
}
