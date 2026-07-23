import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { Loader } from "@/shared/components/loader/Loader";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { SchoolSubjectForm } from "./components/SchoolSubjectForm";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { useGetSchoolSubjectById } from "../../hooks/useGetSchoolSubjectById";
import { useCreateUpdateSchoolSubject } from "../../hooks/useCreateUpdateSchoolSubject";
import type { SchoolSubjectRequest } from "@/interfaces/requests/school-subject.request";

export const SchoolSubjectPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading } = useLoaderStore();
  const schoolSubjectQuery = useGetSchoolSubjectById({ id: id! });
  const createUpdateSchoolSubjectMutation = useCreateUpdateSchoolSubject();
  const title = id === "new" ? "Registro de materia escolar" : "Edición de materia escolar";

  const handleSubmit = async (schoolSubjectRequestLike: Partial<SchoolSubjectRequest>) => {
    try {
      showLoading("Guardando registro");
      await createUpdateSchoolSubjectMutation.mutateAsync({ id: id!, schoolSubjectRequestLike }, {
        onSuccess: (response) => {
          toast.success("El registro se ah actualizado correctamente", { position: "top-right" });
          hideLoading();
          navigate(`/school-subjects/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error("Ocurrio un error al tratar de actualizar el registro", { position: "top-right" });
    }
  }

  if (schoolSubjectQuery.isError) {
    toast.error("No fue posible obtener la información de la materia escolar", { position: "top-right" });
    return <Navigate to="/school-subjects" />;
  }

  if (schoolSubjectQuery.isLoading) {
    return (
      <>
        <div className="w-full relative mx-auto h-full mt-30">
          <Loader title="Cargando información" subtitle="Por favor espere..." />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="w-full py-12 px-10 lg:px-15">

        <div className="mb-10">
          <Breadcrumb items={[
            { label: "Configuración escolar" },
            { label: "Materias escolares", to: "/school-subjects" },
            { label: id === "new" ? "Nueva materia escolar" : schoolSubjectQuery.data?.name || "Edición de materia escolar" },
          ]} />
        </div>

        <PageTitle
          title={title}
          subtitle="Gestiona la información de la materia escolar que estará disponible en el colegio" />

        <div className="flex-1">
          <div className="flex flex-col min-h-full gap-8 mt-5">

            <SchoolSubjectForm
              schoolSubjectResponse={schoolSubjectQuery.data}
              isSubmitting={createUpdateSchoolSubjectMutation.isPending}
              onSubmit={handleSubmit}
            />

          </div>
        </div>
      </div>

    </>
  )
}