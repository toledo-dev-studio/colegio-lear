import { IdCard, Stethoscope, UserRound, Users } from "lucide-react";
import { toast } from "sonner";
import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";

import { useMyAccountPage } from "../hooks/useMyAccountPage";
import { useUpdateStudentAvatar } from "../hooks/useUpdateStudentAvatar";
import { AvatarSection } from "../components/avatar-section/AvatarSection";
import { GuardiansSection } from "../components/guardians-section/GuardiansSection";
import { AllergiesSection } from "../components/allergies-section/AllergiesSection";
import { PersonalDataSection } from "../components/personal-data-section/PersonalDataSection";
import { GuardiansSectionSkeleton } from "../components/guardians-section/GuardiansSectionSkeleton";
import { AllergiesSectionSkeleton } from "../components/allergies-section/AllergiesSectionSkeleton";
import { PersonalDataSectionSkeleton } from "../components/personal-data-section/PersonalDataSectionSkeleton";
import { ModulePageTitle } from "@/shared/components/module-page-title/ModulePageTitle";
import { CardHeader } from "@/shared/components/card-header/CardHeader";
import { useAuthStore } from "@/stores/auth-store/auth.store";

export const MyAccountPage = () => {
  const { context, queries } = useMyAccountPage();
  const { setUser } = useAuthStore();

  const updateAvatarMutation = useUpdateStudentAvatar();

  if (queries.accountQuery.isError) {
    showApiErrorToast(
      queries.accountQuery.error,
      "No fue posible obtener la información de tu cuenta",
    );
  }

  if (queries.guardiansQuery.isError) {
    showApiErrorToast(
      queries.guardiansQuery.error,
      "No fue posible obtener la información de tus tutores",
    );
  }

  if (queries.allergiesQuery.isError) {
    showApiErrorToast(
      queries.allergiesQuery.error,
      "No fue posible obtener la información de tus alergias",
    );
  }

  const handleSubmitAvatar = async (file: File) => {
    try {
      const response = await updateAvatarMutation.mutateAsync({ file });

      if (context.student) {
        setUser({ ...context.student, avatar: response.avatar });
      }

      toast.success("Fotografía de perfil actualizada correctamente", { position: "top-right" });
    } catch (error) {
      console.warn(error);
      showApiErrorToast(error, "Ocurrió un error al tratar de actualizar tu fotografía de perfil");
    }
  };

  return (
    <>
      <section className="page-main-section">

        {/* Page title */}
        <ModulePageTitle
          icon={UserRound}
          badge="Mi cuenta"
          studentName={context.student?.fullName}
          description="Consulta tus datos personales, información médica, tutores y alergias. También puedes actualizar tu fotografía de perfil."
          title="Mi cuenta,"
          cycle={context.academicCycle}
        />

        {/* Avatar */}
        <section className="card">
          <CardHeader
            icon={UserRound}
            title="Fotografía de perfil"
            description="Actualiza la imagen que te identifica en el portal."
            tone="violet"
          />
          {
            queries.accountQuery.isLoading ?
              <section className="flex flex-col items-center justify-center py-4">
                <div className="w-32 h-32 rounded-full bg-muted ring-4 ring-primary/15 animate-pulse" />
              </section> :
              <AvatarSection
                avatar={queries.accountQuery.data?.avatar}
                isSubmitting={updateAvatarMutation.isPending}
                onSubmit={handleSubmitAvatar} />
          }
        </section>

        {/* Personal data */}
        <section className="card">
          <CardHeader
            icon={IdCard}
            title="Datos personales"
            description="Información personal y médica registrada de tu cuenta."
            tone="primary"
          />
          {
            queries.accountQuery.isLoading ?
              <PersonalDataSectionSkeleton /> :
              <PersonalDataSection student={queries.accountQuery.data} />
          }
        </section>

        {/* Guardians */}
        <section className="card">
          <CardHeader
            icon={Users}
            title="Tutores"
            description="Personas responsables y autorizadas para tu cuidado."
            tone="sky"
          />
          {
            queries.guardiansQuery.isLoading ?
              <GuardiansSectionSkeleton /> :
              <GuardiansSection guardians={queries.guardiansQuery.data} />
          }
        </section>

        {/* Allergies */}
        <section className="card">
          <CardHeader
            icon={Stethoscope}
            title="Alergias"
            description="Alergias registradas para tu seguridad en la escuela."
            tone="rose"
          />
          {
            queries.allergiesQuery.isLoading ?
              <AllergiesSectionSkeleton /> :
              <AllergiesSection allergies={queries.allergiesQuery.data} />
          }
        </section>

      </section>
    </>
  )
}