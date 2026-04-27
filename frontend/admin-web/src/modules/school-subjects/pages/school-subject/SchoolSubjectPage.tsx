import { Navigate, useNavigate, useParams } from "react-router"
import { toast } from "sonner";

import { useSchoolSubject } from "../../hooks/useSchoolSubject";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle"
import type { SchoolSubject } from "@/interfaces/entites/school-subject";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { SchoolSubjectForm } from "./components/SchoolSubjectForm";

export const SchoolSubjectPage = () => {

  const navigate = useNavigate();
  const { id } = useParams();

  const title = id === "new" ? 'Registro de materia escolar' : 'Edición de materia escolar';
  const { isLoading, isError, data: schoolSubject, mutation } = useSchoolSubject(id || '');
  const { showLoading, hideLoading } = useLoaderStore();

  const handleSubmit = async (schoolSubjectLike: Partial<SchoolSubject>) => {
    try {
      showLoading('Guardando registro');
      !schoolSubjectLike.id && (schoolSubjectLike.id = "new");

      await mutation.mutateAsync(schoolSubjectLike, {
        onSuccess: (product) => {
          toast.success('Materia escolar actualizada correctamente');
          navigate(`/school-subjects/${product.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error('Ocurrio un error al tratar de actualizar la materia escolar');
    }
  }

  if (isError) {
    toast.error("No fue posible obtener la información de la materia escolar");
    return <Navigate to="/school-subjects" />;
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
          subtitle="Gestiona la información de la materia escolar para que este disponible en el sistema" />

        <div className="flex-1">
          <div className="flex flex-col min-h-full gap-8 mt-14">

            <SchoolSubjectForm
              schoolSubject={undefined}
              isSubmitting={mutation.isPending}
              onSubmit={handleSubmit}
            />

          </div>
        </div>
      </div>

    </>
  )
}