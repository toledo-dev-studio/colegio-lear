import { Navigate, useParams } from "react-router";

import { toast } from "sonner";

import { Loader } from "@/shared/components/loader/Loader";
import { OverviewRibbon } from "./components/OverviewRibbon";
import { StudentGradesGrid } from "./components/StudentGradesGrid";
import { StudentWalletTable } from "./components/StudentWalletTable";
import { PageTitle } from "@/shared/components/page-title/PageTitle";
import { Breadcrumb } from "@/shared/components/breadcrumb/Breadcrumb";
import { OverviewStatsRibbon } from "./components/OverviewStatsRibbon";
import { StudentWalletPaymentsTable } from "./components/StudentWalletPaymentsTable";
import { StudentWalletItemPanelForm } from "./components/StudentWalletItemPanelForm";
import { useAcademicCycleEnrollmentPage } from "./hooks/useAcademicCycleEnrollmentPage";
import { StudentWalletPaymentPanelForm } from "./components/StudentWalletPaymentPanelForm";
import type { StudentWalletItemRequest } from "@/interfaces/requests/student-wallet-item.request";
import type { StudentWalletPaymentRequest } from "@/interfaces/requests/student-wallet-payment.request";

export const AcademicCycleEnrollmentPage = () => {
  // Component hooks & stores
  const { enrollmentId } = useParams();

  // Context hooks & stores configuration
  const { context, queries, mutations, loader, sidePanels, isLoadingPage, isLoadingPageError } = useAcademicCycleEnrollmentPage({ id: enrollmentId! });
  const enrolledStudent = queries.enrollment.getById.data?.status === "enrolled";
  const academicCycleEnrollment = queries.enrollment.getById.data;
  const studentWallet = queries.studentWallet.get.data;
  const studentWalletPayments = queries.studentWalletPayments.get.data;
  const studentGrades = queries.studentGrades.get.data;
  const schoolGroupTeachers = queries.schoolGroupTeachers.get.data;

  // Component functions
  const onSubmitStudentWalletItem = async (studentWalletItemRequestLike: Partial<StudentWalletItemRequest>) => {
    try {
      loader.show("Guardando");
      await mutations.studentWalletItem.update.mutateAsync({
        id: sidePanels.studentWalletItemPanelForm.data?.id!,
        academicCycleId: context.academicCycleId!,
        academicCycleEnrollmentId: enrollmentId!,
        studentWalletItemRequestLike
      }, {
        onSuccess: () => {
          toast.success("Se actualizó el concepto de pago asociado a la cartera del estudiante", { position: "top-right" });
          loader.hide();
          sidePanels.studentWalletItemPanelForm.close();
        }
      });
    } catch (error) {
      console.warn(error);
      loader.hide();
      toast.error("Ocurrió un error al tratar de guardar el registro", { position: "top-right" });
    }
  }

  const onSubmitStudentWalletPayment = async (studentWalletPaymentRequestLike: Partial<StudentWalletPaymentRequest>) => {
    try {
      loader.show("Guardando");
      await mutations.studentWalletPayment.create.mutateAsync({
        academicCycleId: context.academicCycleId!,
        academicCycleEnrollmentId: enrollmentId!,
        studentWalletPaymentRequestLike
      }, {
        onSuccess: () => {
          toast.success("Se registró el pago al concepto de pago seleccionado con éxito", { position: "top-right" });
          loader.hide();
          sidePanels.studentWalletPaymentPanelForm.close();
        }
      });
    } catch (error) {
      console.warn(error);
      loader.hide();
      toast.error("Ocurrió un error al tratar de guardar el registro", { position: "top-right" });
    }
  }

  if (isLoadingPageError) {
    toast.error("No fue posible obtener la información relacionada en alumno seleccionado", { position: "top-right" });
    return <Navigate to={`/academic-cycles/${context.academicCycleId}/enrollments`} />;
  }

  if (isLoadingPage) {
    return (
      <>
        <div className="w-full relative mx-auto h-full mt-30">
          <Loader title="Cargando información" subtitle="Por favor espere..." fullScreen={true} size="default" />
        </div>
      </>
    )
  }

  return (
    <>
      <section className="page-main-section ">

        <Breadcrumb items={[
          { label: "Seguimiento escolar" },
          { label: "Ciclos escolares", to: "/academic-cycles" },
          { label: context.academicCycle?.code || "Edición de ciclo escolar", to: `/academic-cycles/${context.academicCycleId}/enrollments` },
          { label: academicCycleEnrollment?.student?.enrollment! }
        ]} />

        <PageTitle
          title={`DETALLES DE INSCRIPCIÓN "${academicCycleEnrollment?.code}"`}
          subtitle="En esta sección podrás consultar y modificar la información de la incripción del alumno en el ciclo escolar." />

        {/* Ribbon overview */}
        <OverviewRibbon
          student={academicCycleEnrollment?.student!}
          academicCycle={context.academicCycle!}
          academicCycleEnrollment={academicCycleEnrollment!} />

        {/* Student grades grid */}
        <StudentGradesGrid
          studentGradesResponse={studentGrades}
          academicCycleResponse={context.academicCycle!}
          schoolGroupTeachersResponse={schoolGroupTeachers} />

        {/* Payments KPI's overview */}
        <OverviewStatsRibbon
          studentWalletSummary={studentWallet?.summary!} />

        {/* Student wallet table */}
        <StudentWalletTable
          isLoading={queries.studentWallet.get.isFetching}
          enableActions={enrolledStudent}
          data={studentWallet?.items ?? []}
          summary={studentWallet?.summary!}
          handleClickEdit={sidePanels.studentWalletItemPanelForm.open}
          handleClickPay={sidePanels.studentWalletPaymentPanelForm.open} />

        {/* Student wallet payment time line */}
        <StudentWalletPaymentsTable
          isLoading={queries.studentWalletPayments.get.isLoading}
          studentWallet={studentWallet?.items!}
          studentWalletPayments={studentWalletPayments}
        />

        {/* Edit student wallet item panel form */}
        {sidePanels.studentWalletItemPanelForm.isOpen && (
          <StudentWalletItemPanelForm
            studentWalletItemResponse={sidePanels.studentWalletItemPanelForm.data}
            handleClickClose={sidePanels.studentWalletItemPanelForm.close}
            onSubmit={onSubmitStudentWalletItem}
          />
        )}

        {/* Student wallet payment panel form */}
        {sidePanels.studentWalletPaymentPanelForm.isOpen && (
          <StudentWalletPaymentPanelForm
            studentWalletItemResponse={sidePanels.studentWalletPaymentPanelForm.data}
            handleClickClose={sidePanels.studentWalletPaymentPanelForm.close}
            onSubmit={onSubmitStudentWalletPayment}
          />
        )}

      </section>
    </>
  )
}
