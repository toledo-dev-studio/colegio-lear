import { Navigate, useNavigate, useParams } from "react-router"
import { toast } from "sonner";

import { JobTitleForm } from "./components/JobTitleForm";
import { useLoaderStore } from "@/stores/LoaderStore";
import { useGetByIdJobTitle } from "../../hooks/useGetByIdJobTitle";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { JobTitleFormSkeleton } from "./components/JobTitleFormSkeleton";
import { useCreateUpdateJobTitle } from "../../hooks/useCreateUpdateJobTitle";
import type { JobTitleRequest } from "@/interfaces/requests/job-title.request";

export const JobTitlePage = () => {
  // Hooks & stores
  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading } = useLoaderStore();
  const jobTitleQuery = useGetByIdJobTitle({ id: id! });
  const createUpdateJobTitleMutation = useCreateUpdateJobTitle();
  const title = id === "new" ? "Registro de puesto de trabajo" : "Edición de puesto de trabajo";

  // Component functions
  const handleSubmit = async (jobTitleRequestLike: Partial<JobTitleRequest>) => {
    try {
      showLoading("Guardando registro");
      await createUpdateJobTitleMutation.mutateAsync({ id: id!, jobTitleRequestLike }, {
        onSuccess: (response) => {
          toast.success("Puesto de trabajo actualizado correctamente", { position: "top-right" });
          hideLoading();
          navigate(`/job-titles/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error("Ocurrio un error al tratar de actualizar el puesto de trabajo", { position: "top-right" });
    }
  }

  if (jobTitleQuery.isError) {
    toast.error("No fue posible obtener la información del puesto de trabajo", { position: "top-right" });
    return <Navigate to="/job-titles" />;
  }

  return (
    <>
      <div className="w-full py-12 px-10 lg:px-15">

        <div className="mb-10">
          <Breadcrumb items={[
            { label: "Seguridad" },
            { label: "Puestos de trabajo", to: "/job-titles" },
            { label: id === "new" ? "Nuevo puesto de trabajo" : jobTitleQuery.data?.name || "Edición de puesto de trabajo" },
          ]} />
        </div>

        <PageTitle
          title={title}
          subtitle="Getiona la información del puesto de trabajo para que este dispoible en la organiación" />

        <div className="flex-1">
          <div className="flex flex-col min-h-full gap-8 mt-5">

            {
              jobTitleQuery.isLoading ?
                <JobTitleFormSkeleton /> :
                <JobTitleForm
                  jobTitleResponse={jobTitleQuery.data}
                  isSubmitting={createUpdateJobTitleMutation.isPending}
                  onSubmit={handleSubmit}
                />
            }

          </div>
        </div>
      </div>

    </>
  )
}
