import { useState } from "react";
import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import type { StudentWalletItemResponse } from "@/interfaces/responses/student-wallet-item.response";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { useUpdateStudentWalletItem } from "@/modules/academic-cycles/hooks/student-wallet/useUpdateStudentWalletItem";
import { useCreateStudentWalletPayment } from "@/modules/academic-cycles/hooks/student-wallet/useCreateStudentWalletPayment";

export const useStudentWalletGrid = () => {
    // Get context from layout
    const { academicCycleId, academicCycle, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Shared hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    
    // Student wallet item panel form states
    const [isOpenStudentWalletItemPanelForm, setIsOpenStudentWalletItemPanelForm] = useState<boolean>(false);
    const [studentWalletItemToEdit, setStudentWalletItemToEdit] = useState<Partial<StudentWalletItemResponse>>();

    // Student wallet payment panel form states
    const [isOpenStudentWalletPaymentPanelForm, setIsOpenStudentWalletPaymentPanelForm] = useState<boolean>(false);

    // Mutations
    const updateStudentWalletItemMutation = useUpdateStudentWalletItem();
    const createStudentWalletPaymentMutation = useCreateStudentWalletPayment();

    return {
        context: {
            isLocked,
            academicCycle,
            academicCycleId,
        },
        mutations: {
            studentWalletItem: {
                update: updateStudentWalletItemMutation,
            },
            studentWalletPayment: {
                create: createStudentWalletPaymentMutation,
            }
        },
        loader: {
            show: showLoading,
            hide: hideLoading,
        },
        sidePanels: {
            studentWalletItemPanelForm: {
                data: studentWalletItemToEdit,
                isOpen: isOpenStudentWalletItemPanelForm,
                open: (item: StudentWalletItemResponse) => {
                    setStudentWalletItemToEdit(item);
                    setIsOpenStudentWalletItemPanelForm(true);
                },
                close: () => {
                    setStudentWalletItemToEdit({});
                    setIsOpenStudentWalletItemPanelForm(false)
                }
            },
            studentWalletPaymentPanelForm: {
                data: studentWalletItemToEdit,
                isOpen: isOpenStudentWalletPaymentPanelForm,
                open: (item: StudentWalletItemResponse) => {
                    setStudentWalletItemToEdit(item);
                    setIsOpenStudentWalletPaymentPanelForm(true);
                },
                close: () => {
                    setStudentWalletItemToEdit({});
                    setIsOpenStudentWalletPaymentPanelForm(false)
                }
            }
        },
    }
}
