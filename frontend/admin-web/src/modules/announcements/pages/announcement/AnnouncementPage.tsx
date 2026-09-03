import { Navigate, useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";

import { useLoaderStore } from "@/stores/LoaderStore";
import { AnnouncementForm } from "./components/AnnouncementForm";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { AnnouncementFormSkeleton } from "./components/AnnouncementFormSkeleton";
import type { AnnouncementRequest } from "@/interfaces/requests/announcement.request";
import { useGetAnnouncementById } from "../../hooks/announcements/useGetAnnouncementById";
import { useCreateUpdateAnnouncement } from "../../hooks/announcements/useCreateUpdateAnnouncement";

export const AnnouncementPage = () => {
  // Component hooks & stores
  const navigate = useNavigate();
  const { id } = useParams();

  const { showLoading, hideLoading } = useLoaderStore();
  const announcementQuery = useGetAnnouncementById({ id: id! });
  const createUpdateAnnouncementMutation = useCreateUpdateAnnouncement();
  const title = id === "new" ? "Registro de campaña" : "Edición de campaña";

  const handleSubmit = async (announcementRequestLike: Partial<AnnouncementRequest>) => {
    try {
      showLoading("Guardando registro");
      await createUpdateAnnouncementMutation.mutateAsync({ id: id!, announcementRequestLike }, {
        onSuccess: (response) => {
          toast.success("Registro actualizado de forma exitosa", { position: "top-right" });
          hideLoading();
          navigate(`/announcements/${response.id}`);
        }
      });
    } catch (error) {
      console.warn(error);
      hideLoading();
      showApiErrorToast(error, "Ocurrio un error al tratar de actualizar el registro seleccionado");
    }
  }

  if (announcementQuery.isError) {
    showApiErrorToast(announcementQuery.error, "No fue posible obtener la información del registro seleccionado");
    return <Navigate to="/announcements" />;
  }

  return (
    <>
      <div className="w-full py-12 px-10 lg:px-15">

        <div className="mb-10">
          <Breadcrumb items={[
            { label: "Seguimiento escolar" },
            { label: "Campañas & comunicados", to: "/announcements" },
            { label: id === "new" ? "Nueva campaña o comunicado" : announcementQuery.data?.name || "Edición de campaña o comunicado" },
          ]} />
        </div>

        <PageTitle
          title={title}
          subtitle="Gestiona las campañas & comunicados disponibles en el colegio y la organización" />

        <div className="flex-1">
          <section className="flex flex-col min-h-full gap-8 mt-5">
            {
              announcementQuery.isLoading ?
                <AnnouncementFormSkeleton /> :
                <AnnouncementForm
                  isNew={id === "new"}
                  announcementResponse={announcementQuery.data}
                  isSubmitting={createUpdateAnnouncementMutation.isPending}
                  onSubmit={handleSubmit}
                />
            }
          </section>
        </div>
      </div>

    </>
  )
}
