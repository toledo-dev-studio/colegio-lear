import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { AnnouncementForm } from "./components/AnnouncementForm";
import { CustomPageTitle } from "@/shared/components/CustomPageTitle";
import type { Announcement } from "@/interfaces/entites/announcement";
import { CustomFullScreenLoading } from "@/shared/components/CustomFullScreenLoading";
import { useGetByIdAnnouncement } from "../../hooks/announcements/useGetByIdAnnouncement";
import { useCreateUpdateAnnouncement } from "../../hooks/announcements/useCreateUpdateAnnouncement";

export const AnnouncementPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading } = useLoaderStore();
  const announcementQuery = useGetByIdAnnouncement(id || "");
  const createUpdateAnnouncementMutation = useCreateUpdateAnnouncement();
  const title = id === "new" ? "Registro de campaña" : "Edición de campaña";

  const handleSubmit = async (announcementLike: Partial<Announcement>) => {
    try {
      showLoading("Guardando registro");
      await createUpdateAnnouncementMutation.mutateAsync(announcementLike, {
        onSuccess: (response) => {
          toast.success("Registro actualizado de forma exitosa", { position: "top-right" });
          hideLoading();
          navigate(`/announcements/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      toast.error("Ocurrio un error al tratar de actualizar el registro seleccionado", { position: "top-right" });
    }
  }

  if (announcementQuery.isError) {
    toast.error("No fue posible obtener la información del registro seleccionado", { position: "top-right" });
    return <Navigate to="/announcements" />;
  }

  if (announcementQuery.isLoading) {
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
              announcement={announcementQuery.data}
              isSubmitting={createUpdateAnnouncementMutation.isPending}
              onSubmit={handleSubmit}
            />

          </div>
        </div>
      </div>

    </>
  )
}
