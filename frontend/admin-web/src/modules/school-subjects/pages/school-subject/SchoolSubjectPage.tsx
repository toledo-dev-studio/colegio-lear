import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { SchoolSubjectForm } from "./components/SchoolSubjectForm";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import type { SchoolSubject } from "@/interfaces/entites/school-subject";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useGetByIdSchoolSubject } from "../../hooks/school-subjects/useGetByIdSchoolSubject";
import { useCreateUpdateSchoolSubject } from "../../hooks/school-subjects/useCreateUpdateSchoolSubject";

export const SchoolSubjectPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading } = useLoaderStore();
  const schoolSubjectQuery = useGetByIdSchoolSubject(id || "");
  const createUpdateSchoolSubjectMutation = useCreateUpdateSchoolSubject();
  const title = id === "new" ? "Registro de materia escolar" : "Edición de materia escolar";

  const handleSubmit = async (schoolSubjectLike: Partial<SchoolSubject>) => {
    try {
      showLoading("Guardando registro");
      !schoolSubjectLike.id && (schoolSubjectLike.id = "new");

      await createUpdateSchoolSubjectMutation.mutateAsync(schoolSubjectLike, {
        onSuccess: (response) => {
          toast.success('El registro se ah actualizado correctamente', { position: "top-right" });
          hideLoading();
          navigate(`/school-subjects/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error('Ocurrio un error al tratar de actualizar el registro', { position: "top-right" });
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
          subtitle="Gestiona la información de la materia escolar que estará disponible en el colegio" />

        <div className="flex-1">
          <div className="flex flex-col min-h-full gap-8 mt-14">

            <SchoolSubjectForm
              schoolSubject={schoolSubjectQuery.data}
              isSubmitting={createUpdateSchoolSubjectMutation.isPending}
              onSubmit={handleSubmit}
            />

          </div>
        </div>
      </div>

    </>
  )
}