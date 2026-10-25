import { useState } from "react";

import { useLoaderStore } from "@/stores/LoaderStore";
import { useDeleteRecord } from "@/hooks/useDeleteRecord";
import { useGetSecurityRoles } from "@/modules/security-roles/hooks/useGetSecurityRoles";
import type { SecurityRoleResponse } from "@/interfaces/responses/security-role.response";
import { useDeleteSecurityRoleById } from "@/modules/security-roles/hooks/useDeleteSecurityRoleById";
import { useGetPagedSecurityRoles } from "@/modules/security-roles/hooks/useGetPagedSecurityRoles";

export const useSecurityRolesPage = () => {
  // Hooks & stores
  const { showLoading, hideLoading } = useLoaderStore();
  const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
  const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<SecurityRoleResponse>();

  // Queries
  const pagedSecurityRolesQuery = useGetPagedSecurityRoles();

  // Mutations
  const exportSecurityRolesMutation = useGetSecurityRoles();
  const deleteSecurityRoleMutation = useDeleteSecurityRoleById();

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
      securityRoles: {
        paged: pagedSecurityRolesQuery
      }
    },
    mutations: {
      securityRoles: {
        export: exportSecurityRolesMutation,
        delete: deleteSecurityRoleMutation
      }
    }
  }
}
