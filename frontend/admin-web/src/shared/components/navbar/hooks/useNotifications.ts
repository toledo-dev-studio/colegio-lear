import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import type { NotificationResponse } from "@/interfaces/responses/notification.response";
import { getPagedNotificationsActionAsync } from "../actions/get-paged-notifications.action";
import { markNotificationAsReadActionAsync } from "../actions/mark-notification-as-read.action";

interface Options {
    page: number;
    employeeId: string;
}

export const useNotifications = () => {
    const [totalPages, setTotalPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    
    const getPagedNotificationMutation = useMutation({
        mutationFn: (options: Options) => getPagedNotificationsActionAsync(options),
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
        mutationFn: (options: { id: string; employeeId: string }) => markNotificationAsReadActionAsync(options),
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
