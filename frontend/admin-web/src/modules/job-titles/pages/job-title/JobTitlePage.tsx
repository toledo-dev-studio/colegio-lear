import { Navigate, useNavigate, useParams } from "react-router"
import { toast } from "sonner";

import { useJobTitle } from "../../hooks/useJobTitle";
import { JobTitleForm } from "./components/JobTitleForm";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle"
import type { JobTitle } from "@/interfaces/entites/job-title.interface";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useLoaderStore } from "@/shared/stores/LoaderStore";

export const JobTitlePage = () => {

  const navigate = useNavigate();
  const { id } = useParams();

  const title = id === "new" ? 'Registro de puesto de trabajo' : 'Edición de puesto de trabajo';
  const { isLoading, isError, data: jobTitle, mutation } = useJobTitle(id || '');
  const { showLoading, hideLoading } = useLoaderStore();

  const handleSubmit = async (jobTitleLike: Partial<JobTitle>) => {
    try {
      showLoading('Guardando registro');
      !jobTitleLike.id && (jobTitleLike.id = "new");

      await mutation.mutateAsync(jobTitleLike, {
        onSuccess: (response) => {
          toast.success('Puesto de trabajo actualizado correctamente');
          navigate(`/job-titles/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error('Ocurrio un error al tratar de actualizar el puesto de trabajo');
    }
  }

  if (isError) {
    toast.error("No fue posible obtener la información del puesto de trabajo");
    return <Navigate to="/job-titles" />;
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
          subtitle="Getiona la información del puesto de trabajo para que este dispoible en el sistema" />

        <div className="flex-1">
          <div className="flex flex-col min-h-full gap-8 mt-14">

            <JobTitleForm
              jobTitle={jobTitle}
              isSubmitting={mutation.isPending}
              onSubmit={handleSubmit}
            />

          </div>
        </div>
      </div>

    </>
  )
}
