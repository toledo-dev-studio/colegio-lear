import { toast } from "sonner";
import { Navigate, useNavigate, useParams } from "react-router";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useAnnouncement } from "../../hooks/useAnnouncement";
import { AnnouncementForm } from "./components/AnnouncementForm";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import type { Announcement } from "@/interfaces/entites/announcement";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";

export const AnnouncementPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const title = id === "new" ? 'Registro de campaña' : 'Edición de campaña';
  const { isLoading, isError, data: announcement, mutation } = useAnnouncement(id || '');
  const { showLoading, hideLoading } = useLoaderStore();

  const handleSubmit = async (announcementLike: Partial<Announcement>) => {
      console.log(announcementLike);
      return;
    
    try {
      showLoading('Guardando registro');
      !announcementLike.id && (announcementLike.id = "new");

      await mutation.mutateAsync(announcementLike, {
        onSuccess: (response) => {
          toast.success('Registro actualizado de forma exitosa');
          navigate(`/announcements/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error('Ocurrio un error al tratar de actualizar el registro seleccionado');
    }
  }

  if (isError) {
    toast.error("No fue posible obtener la información del registro seleccionado");
    return <Navigate to="/announcements" />;
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
          subtitle="Gestiona las campañas & comunicados disponibles en el colegio y la organización" />

        <div className="flex-1">
          <div className="flex flex-col min-h-full gap-8 mt-14">

            <AnnouncementForm
              announcement={announcement}
              isSubmitting={mutation.isPending}
              onSubmit={handleSubmit}
            />

          </div>
        </div>
      </div>

    </>
  )
}
