import { toast } from "sonner";
import { StudentWalletTable } from "./StudentWalletTable";
import { OverviewStatsRibbon } from "./OverviewStatsRibbon";
import { StudentWalletPaymentsTable } from "./StudentWalletPaymentsTable";
import { useStudentWalletGrid } from "../../hooks/useAcademicCycleEnrollmentPage";
import { StudentWalletTableSkeleton } from "./skeletons/StudentWalletTableSkeleton";
import { StudentWalletItemPanelForm } from "./side-panels/StudentWalletItemPanelForm";
import { OverviewStatsRibbonSkeleton } from "./skeletons/OverviewStatsRibbonSkeleton";
import { StudentWalletPaymentPanelForm } from "./side-panels/StudentWalletPaymentPanelForm";
import type { StudentWalletItemRequest } from "@/interfaces/requests/student-wallet-item.request";
import type { AcademicCycleEnrollmentStatusKey } from "@/lib/key-value-pairs/key-value-pair-types";
import { StudentWalletPaymentsTableSkeleton } from "./skeletons/StudentWalletPaymentsTableSkeleton";
import type { StudentWalletPaymentRequest } from "@/interfaces/requests/student-wallet-payment.request";
import { useGetStudentWallet } from "@/modules/academic-cycles/hooks/student-wallet/useGetStudentWallet";
import { useGetStudentWalletPayments } from "@/modules/academic-cycles/hooks/student-wallet/useGetStudentWalletPayments";

interface Props {
    enrollmentId: string;
    academicCycleId: string;
    enrollmentStatus?: AcademicCycleEnrollmentStatusKey;
}

export const StudentWalletGrid = ({ enrollmentId, academicCycleId, enrollmentStatus }: Props) => {
    // Component hooks & stores
    const { context, mutations, loader, sidePanels } = useStudentWalletGrid();
    const { data: wallet, isLoading: isLoadingWallet } = useGetStudentWallet({ academicCycleId: academicCycleId, academicCycleEnrollmentId: enrollmentId });
    const { data: payments, isLoading: isLoadingPayments } = useGetStudentWalletPayments({ academicCycleId: academicCycleId, academicCycleEnrollmentId: enrollmentId });

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
                        enableActions={enrollmentStatus === "enrolled"}
                        data={wallet?.items ?? []}
                        summary={wallet?.summary!}
                        handleClickEdit={() => { }}
                        handleClickPay={() => { }} />
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
