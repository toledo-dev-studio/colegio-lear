import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { NotificationResponse } from "@/interfaces/responses/notification.response";
import { markNotificationAsReadAsync } from "../api/mark-notification-as-read.api";
import { getPagedNotificationsAsync } from "../api/get-paged-notifications.api";

interface Options {
    page: number;
    studentId: string;
}

export const useNotifications = () => {
    const [totalPages, setTotalPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    
    const getPagedNotificationMutation = useMutation({
        mutationFn: (options: Options) => getPagedNotificationsAsync(options),
        onSuccess: (response, variables) => {
            setTotalPages(response.totalPages);
            setCurrentPage(response.currentPage);
            setNotifications(prev => {
                if (variables.page === 1)
                    return response.data;
                return [...prev, ...response.data];
            });
        }
    });

    const markNotificationAsReadMutation = useMutation({
        mutationFn: (options: { id: string; studentId: string }) => markNotificationAsReadAsync(options),
        onSuccess: (response) => {
            setNotifications(prev => prev.map(notification => {
                if (notification.id === response.id)
                    notification.read = true;
                return notification;
            }));
        }
    });

    return {
        notifications,
        currentPage,
        totalPages,
        totalCount: notifications.length,
        unreadCount: notifications.filter(n => !n.read).length,
        isLoadingNotifications: getPagedNotificationMutation.isPending,
        getPagedAsync: getPagedNotificationMutation,
        markNotificationAsReadAsync: markNotificationAsReadMutation
    }
}
