import { toast } from "sonner";
import { showApiErrorToast } from "@/lib/helpers/error-toast.helper";
import { StudentWalletTable } from "./StudentWalletTable";
import { OverviewStatsRibbon } from "./OverviewStatsRibbon";
import { StudentWalletPaymentsTable } from "./StudentWalletPaymentsTable";
import { useStudentWalletGrid } from "../../hooks/useAcademicCycleEnrollmentPage";
import { StudentWalletTableSkeleton } from "./skeletons/StudentWalletTableSkeleton";
import { StudentWalletItemPanelForm } from "./side-panels/StudentWalletItemPanelForm";
import { OverviewStatsRibbonSkeleton } from "./skeletons/OverviewStatsRibbonSkeleton";
import { StudentWalletPaymentPanelForm } from "./side-panels/StudentWalletPaymentPanelForm";
import type { StudentWalletItemRequest } from "@/interfaces/requests/student-wallet-item.request";
import { StudentWalletPaymentsTableSkeleton } from "./skeletons/StudentWalletPaymentsTableSkeleton";
import type { StudentWalletPaymentRequest } from "@/interfaces/requests/student-wallet-payment.request";
import { useGetStudentWallet } from "@/modules/academic-cycles/hooks/student-wallet/useGetStudentWallet";
import { useGetStudentWalletPayments } from "@/modules/academic-cycles/hooks/student-wallet/useGetStudentWalletPayments";
import type { AcademicCycleEnrollmentStatusKey, AcademicCycleStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";

interface Props {
    enrollmentId: string;
    academicCycleId: string;
    academicCycleStatus?: AcademicCycleStatusKey;
    enrollmentStatus?: AcademicCycleEnrollmentStatusKey;
    loggedInUserCanWrite: boolean;
}

export const StudentWalletGrid = ({ enrollmentId, academicCycleId, academicCycleStatus, enrollmentStatus, loggedInUserCanWrite }: Props) => {
    // Component hooks & stores
    const { context, mutations, loader, sidePanels } = useStudentWalletGrid();
    const { data: wallet, isLoading: isLoadingWallet, isError: isErrorWallet, error: errorWallet } = useGetStudentWallet({ academicCycleId: academicCycleId, academicCycleEnrollmentId: enrollmentId });
    const { data: payments, isLoading: isLoadingPayments, isError: isErrorPayments, error: errorPayments } = useGetStudentWalletPayments({ academicCycleId: academicCycleId, academicCycleEnrollmentId: enrollmentId });

    if (isErrorWallet) {
        showApiErrorToast(errorWallet, "No fue posible obtener información de la cartera del estudiante");
    }

    if (isErrorPayments) {
        showApiErrorToast(errorPayments, "No fue posible obtener información de los pagos del estudiante");
    }

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
            showApiErrorToast(error, "Ocurrió un error al tratar de guardar el registro");
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
            showApiErrorToast(error, "Ocurrió un error al tratar de guardar el registro");
        }
    }

    return (
        <>
            {/* Payments KPI's overview */}
            {
                isLoadingWallet ?
                    <OverviewStatsRibbonSkeleton /> :
                    <OverviewStatsRibbon studentWalletSummary={wallet?.summary!} />
            }

            {/* Student wallet table */}
            {
                isLoadingWallet ?
                    <StudentWalletTableSkeleton /> :
                    <StudentWalletTable
                        enableActions={enrollmentStatus === "enrolled" && academicCycleStatus === "active" && loggedInUserCanWrite}
                        data={wallet?.items ?? []}
                        summary={wallet?.summary!}
                        handleClickEdit={sidePanels.studentWalletItemPanelForm.open}
                        handleClickPay={sidePanels.studentWalletPaymentPanelForm.open} />
            }

            {/* Student wallet payment time line */}
            {
                isLoadingPayments ?
                    <StudentWalletPaymentsTableSkeleton /> :
                    <StudentWalletPaymentsTable
                        studentWallet={wallet?.items ?? []}
                        studentWalletPayments={payments}
                    />
            }

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
        </>
    )
}
