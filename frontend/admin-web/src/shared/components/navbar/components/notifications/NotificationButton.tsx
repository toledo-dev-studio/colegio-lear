import { useEffect, useState } from "react";

import { Bell } from "lucide-react";

import { Spinner } from "@/shared/components/spinner/Spinner";
import { useNotifications } from "../../hooks/useNotifications";
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { userStoreId } from "@/modules/auth/stores/auth.store.selectors";
import { NotificationResultsDropdown } from "./NotificationResultsDropdown";
import type { NotificationResponse } from "@/interfaces/responses/notification.response";
import { AnnouncementViewerOverlay } from "./AnnouncementViewerOverlay";

export const NotificationButton = () => {
    // Component hooks & stores
    const loggedInUserId = useAuthStore(userStoreId);
    const [toggleDropdown, setToggleDropdown] = useState<boolean>(false);
    const [selectedNotification, setSelectedNotification] = useState<NotificationResponse | undefined>(undefined);
    const { notifications, currentPage, totalPages, totalCount, unreadCount, isLoadingNotifications, markNotificationAsReadAsync, getPagedAsync } = useNotifications();

    useEffect(() => {
        getPagedAsync.mutateAsync({ employeeId: loggedInUserId!, page: 1 })
        return () => { }
    }, []);

    return (
        <>
            <section className="relative">

                <button data-testid="header-notifications" className="icon-btn relative" aria-label="Notificaciones" onClick={() => setToggleDropdown(prev => !prev)}>
                    <Bell className="w-4.5 h-4.5" />
                    {isLoadingNotifications && (<Spinner className="absolute top-2 right-2 w-3 h-3 border-3" variant="default" />)}
                    {(!isLoadingNotifications && notifications.some(x => !x.read)) && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />}
                </button>
                {
                    toggleDropdown && (
                        <NotificationResultsDropdown
                            open={toggleDropdown}
                            currentPage={currentPage}
                            isLoadingNotifications={isLoadingNotifications}
                            notifications={notifications}
                            totalCount={totalCount}
                            totalPages={totalPages}
                            unreadCount={unreadCount}
                            onLoadMore={async () => {
                                await getPagedAsync.mutateAsync({ employeeId: loggedInUserId!, page: currentPage + 1 })
                            }}
                            onClose={() => setToggleDropdown(false)}
                            onNotificationClick={async (notification: NotificationResponse) => {
                                if(notification.type === "announcement") 
                                    setSelectedNotification(notification);
                                else
                                    setSelectedNotification(undefined);
                                if (!notification.read) {
                                    await markNotificationAsReadAsync.mutateAsync({ employeeId: loggedInUserId!, id: notification.id });
                                }
                                // TODO: Logica para redirigir a un chat en un grupo escolar para docentes
                            }}
                        />
                    )
                }

                {
                    selectedNotification && selectedNotification.type === "announcement" && (
                        <AnnouncementViewerOverlay announcementId={selectedNotification.relatedRecordId} onClose={() => { setSelectedNotification(undefined) }} />
                    )
                }

            </section>
        </>
    )
}
