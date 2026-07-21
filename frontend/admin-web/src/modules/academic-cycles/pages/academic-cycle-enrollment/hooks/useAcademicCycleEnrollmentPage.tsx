import { useState } from "react";
import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import type { StudentWalletItemResponse } from "@/interfaces/responses/student-wallet-item.response";
import { useGetStudentWallet } from "@/modules/academic-cycles/hooks/student-wallet/useGetStudentWallet";
import { useGetStudentGrades } from "@/modules/academic-cycles/hooks/student-grades/useGetStudentGrades";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { useUpdateStudentWalletItem } from "@/modules/academic-cycles/hooks/student-wallet/useUpdateStudentWalletItem";
import { useGetStudentWalletPayments } from "@/modules/academic-cycles/hooks/student-wallet/useGetStudentWalletPayments";
import { useCreateStudentWalletPayment } from "@/modules/academic-cycles/hooks/student-wallet/useCreateStudentWalletPayment";
import { useGetAcademicCycleEnrollmentById } from "@/modules/academic-cycles/hooks/academic-cycle-enrollments/useGetAcademicCycleEnrollmentById";
import { useGetTeachersForAcademicCycleSchoolGroup } from "@/modules/academic-cycles/hooks/academic-cycle-school-groups/useGetTeachersForAcademicCycleSchoolGroup";

interface Props {
    id: string;
}

export const useAcademicCycleEnrollmentPage = ({ id }: Props) => {
    // Get context from layout
    const { academicCycleId, academicCycle, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Shared hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    
    // Student wallet item panel form states
    const [isOpenStudentWalletItemPanelForm, setIsOpenStudentWalletItemPanelForm] = useState<boolean>(false);
    const [studentWalletItemToEdit, setStudentWalletItemToEdit] = useState<Partial<StudentWalletItemResponse>>();

    // Student wallet payment panel form states
    const [isOpenStudentWalletPaymentPanelForm, setIsOpenStudentWalletPaymentPanelForm] = useState<boolean>(false);

    // Queries
    const getAcademicCycleEnrollmentByIdQuery = useGetAcademicCycleEnrollmentById({ id, academicCycleId: academicCycleId! });
    const getStudentGradesQuery = useGetStudentGrades({ academicCycleId: academicCycleId!, academicCycleEnrollmentId: id });
    const getStudentWalletQuery = useGetStudentWallet({ academicCycleId: academicCycleId!, academicCycleEnrollmentId: id });
    const getStudentWalletPaymentsQuery = useGetStudentWalletPayments({ academicCycleId: academicCycleId!, academicCycleEnrollmentId: id });
    const getTeachersForAcademicCycleSchoolGroupQuery = useGetTeachersForAcademicCycleSchoolGroup({ academicCycleId: academicCycleId!, academicCycleSchoolGroupId: getAcademicCycleEnrollmentByIdQuery.data?.academicCycleSchoolGroupId! });

    // Mutations
    const updateStudentWalletItemMutation = useUpdateStudentWalletItem();
    const createStudentWalletPaymentMutation = useCreateStudentWalletPayment();

    return {
        context: {
            isLocked,
            academicCycle,
            academicCycleId,
        },
        queries: {
            enrollment: {
                getById: getAcademicCycleEnrollmentByIdQuery
            },
            studentWallet: {
                get: getStudentWalletQuery,
            },
            studentWalletPayments: {
                get: getStudentWalletPaymentsQuery,
            },
            studentGrades: {
                get: getStudentGradesQuery,
            },
            schoolGroupTeachers: {
                get: getTeachersForAcademicCycleSchoolGroupQuery
            }
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
        isLoadingPage: getAcademicCycleEnrollmentByIdQuery.isLoading || getStudentWalletQuery.isLoading || getStudentWalletPaymentsQuery.isLoading || getStudentGradesQuery.isLoading || getTeachersForAcademicCycleSchoolGroupQuery.isLoading,
        isError: getAcademicCycleEnrollmentByIdQuery.isError || getStudentWalletQuery.isError || getStudentWalletPaymentsQuery.isError || getStudentGradesQuery.isError || getTeachersForAcademicCycleSchoolGroupQuery.isError,
    }
}
