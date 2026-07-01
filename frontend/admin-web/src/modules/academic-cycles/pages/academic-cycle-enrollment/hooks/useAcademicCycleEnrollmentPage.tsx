import { useOutletContext } from "react-router";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useGetStudentWallet } from "@/modules/academic-cycles/hooks/student-wallet/useGetStudentWallet";
import type { AcademicCycleLayoutContext } from "@/modules/academic-cycles/interfaces/academic-cycle-layout-context";
import { useGetStudentWalletSummary } from "@/modules/academic-cycles/hooks/student-wallet/useGetStudentWalletSummary";
import { useGetAcademicCycleEnrollmentById } from "@/modules/academic-cycles/hooks/academic-cycle-enrollments/useGetAcademicCycleEnrollmentById";

interface Props {
    id: string;
}

export const useAcademicCycleEnrollmentPage = ({ id }: Props) => {
    // Get context from layout
    const { academicCycleId, academicCycle, isLocked } = useOutletContext<AcademicCycleLayoutContext>();

    // Shared hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();

    // Queries
    const getAcademicCycleEnrollmentByIdQuery = useGetAcademicCycleEnrollmentById({ id, academicCycleId: academicCycleId! });
    const getStudentWalletQuery = useGetStudentWallet({ academicCycleId: academicCycleId!, academicCycleEnrollmentId: id });
    const getStudentWalletSummaryQuery = useGetStudentWalletSummary({ academicCycleId: academicCycleId!, academicCycleEnrollmentId: id });

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
                getSummary: getStudentWalletSummaryQuery
            }
        },
        mutations: {

        },
        loader: {
            show: showLoading,
            hide: hideLoading,
        },
        isLoadingPage: getAcademicCycleEnrollmentByIdQuery.isLoading || getStudentWalletQuery.isLoading || getStudentWalletSummaryQuery.isLoading,
        isLoadingPageError: getAcademicCycleEnrollmentByIdQuery.isError || getStudentWalletQuery.isError || getStudentWalletSummaryQuery.isError,
    }
}
