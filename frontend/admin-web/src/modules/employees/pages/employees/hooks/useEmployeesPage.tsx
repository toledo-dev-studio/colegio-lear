import { useState } from "react";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import type { EmployeeResponse } from "@/interfaces/responses/employee.response";
import { useGetEmployees } from "@/modules/employees/hooks/employees/useGetEmployees";
import { useGetPagedEmployees } from "@/modules/employees/hooks/employees/useGetPagedEmployees";
import { useDeleteEmployeeById } from "@/modules/employees/hooks/employees/useDeleteEmployeeById";

export const useEmployeesPage = () => {
    // Hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<EmployeeResponse>();

    // Queries
    const pagedEmployeesQuery = useGetPagedEmployees();

    // Mutations
    const exportEmployeesMutation = useGetEmployees();
    const deleteEmployeeMutation = useDeleteEmployeeById();

    return {
        loader: {
            show: showLoading,
            hide: hideLoading
        },
        advancedFilters: {
            isOpen: isOpenAdvancedFiltersPanel,
            open: () => setIsOpenAdvancedFiltersPanel(true),
            close: () => setIsOpenAdvancedFiltersPanel(false),
        },
        deleteModal: {
            isOpen: isOpenSingleDeleteModal,
            record: recordToDelete,
            close: closeDeleteModal,
            open: openDeleteModal
        },
        queries: {
            employees: {
                paged: pagedEmployeesQuery
            }
        },
        mutations: {
            employees: {
                export: exportEmployeesMutation,
                delete: deleteEmployeeMutation
            }
        }
    }
}
