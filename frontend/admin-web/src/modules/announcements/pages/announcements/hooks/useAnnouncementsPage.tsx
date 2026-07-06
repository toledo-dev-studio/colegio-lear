import { useState } from "react";

import { useLoaderStore } from "@/shared/stores/LoaderStore";
import { useDeleteRecord } from "@/shared/hooks/useDeleteRecord";
import type { AnnouncementResponse } from "@/interfaces/responses/announcement.response";
import { useGetAnnouncements } from "@/modules/announcements/hooks/announcements/useGetAnnouncements";
import { useGetPagedAnnouncements } from "@/modules/announcements/hooks/announcements/useGetPagedAnnouncements";
import { useDeleteAnnouncementById } from "@/modules/announcements/hooks/announcements/useDeleteAnnouncementById";

export const useAnnouncementsPage = () => {
    // Hooks & stores
    const { showLoading, hideLoading } = useLoaderStore();
    const [isOpenAdvancedFiltersPanel, setIsOpenAdvancedFiltersPanel] = useState<boolean>(false);
    const { isOpenSingleDeleteModal, recordToDelete, openDeleteModal, closeDeleteModal } = useDeleteRecord<AnnouncementResponse>();

    // Queries
    const pagedAnnouncementsQuery = useGetPagedAnnouncements();

    // Mutations
    const exportAnnouncementsMutation = useGetAnnouncements();
    const deleteAnnouncementMutation = useDeleteAnnouncementById();

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
            announcements: {
                paged: pagedAnnouncementsQuery
            }
        },
        mutations: {
            announcements: {
                export: exportAnnouncementsMutation,
                delete: deleteAnnouncementMutation
            }
        }
    }
}



