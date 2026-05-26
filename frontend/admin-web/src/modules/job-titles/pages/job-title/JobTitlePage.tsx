import { Navigate, useNavigate, useParams } from "react-router"
import { toast } from "sonner";

import { JobTitleForm } from "./components/JobTitleForm";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useGetByIdJobTitle } from "../../hooks/useGetByIdJobTitle";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle"
import type { JobTitle } from "@/interfaces/entites/job-title";
import { useCreateUpdateJobTitle } from "../../hooks/useCreateUpdateJobTitle";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { CustomBreadcrumb } from "@/shared/components/CustomBreadcrumb";

export const JobTitlePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading } = useLoaderStore();
  const jobTitleQuery = useGetByIdJobTitle(id || "");
  const createUpdateJobTitleMutation = useCreateUpdateJobTitle();
  const title = id === "new" ? 'Registro de puesto de trabajo' : 'Edición de puesto de trabajo';

  const handleSubmit = async (jobTitleLike: Partial<JobTitle>) => {
    try {
      showLoading('Guardando registro');
      await createUpdateJobTitleMutation.mutateAsync(jobTitleLike, {
        onSuccess: (response) => {
          toast.success('Puesto de trabajo actualizado correctamente', { position: "top-right" });
          hideLoading();
          navigate(`/job-titles/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error('Ocurrio un error al tratar de actualizar el puesto de trabajo', { position: "top-right" });
    }
  }

  if (jobTitleQuery.isError) {
    toast.error("No fue posible obtener la información del puesto de trabajo", { position: "top-right" });
    return <Navigate to="/job-titles" />;
  }

  if (jobTitleQuery.isLoading) {
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
            { label: "Seguridad" },
            { label: "Puestos de trabajo", to: "/job-titles" },
            { label: id === "new" ? "Nuevo puesto de trabajo" : jobTitleQuery.data?.name || "Edición de puesto de trabajo" },
          ]} />
        </div>

        <CustomPageTitle
          title={title}
          subtitle="Getiona la información del puesto de trabajo para que este dispoible en la organiación" />

        <div className="flex-1">
          <div className="flex flex-col min-h-full gap-8 mt-14">

            <JobTitleForm
              jobTitle={jobTitleQuery.data}
              isSubmitting={createUpdateJobTitleMutation.isPending}
              onSubmit={handleSubmit}
            />

          </div>
        </div>
      </div>

    </>
  )
}
