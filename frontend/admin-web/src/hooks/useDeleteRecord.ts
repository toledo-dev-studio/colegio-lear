import { useState } from "react";

export const useDeleteRecord = <T extends Record<string, any>>() => {
    const [isOpenSingleDeleteModal, setIsOpenSingleDeleteModal] = useState<boolean>(false);
    const [recordToDelete, setRecordToDelete] = useState<T | undefined>(undefined);

    const openDeleteModal = (record: T) => {
        setRecordToDelete(record);
        setIsOpenSingleDeleteModal(true);
    }

    const closeDeleteModal = () => {
        setRecordToDelete(undefined);
        setIsOpenSingleDeleteModal(false);
    }

    return {
        recordToDelete,
        isOpenSingleDeleteModal,
        openDeleteModal,
        closeDeleteModal
    }
}
