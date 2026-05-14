import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AnnouncementsPage } from "../pages/announcements/AnnouncementsPage";

const SystemLayout = lazy(() => import('@/shared/layout/SystemLayout'));
const AnnouncementsLayout = lazy(() => import('@/modules/announcements/layout/AnnouncementsLayout'));

export const announcementsRouter: RouteObject = {
    path: '/announcements',
    element:
        <SystemLayout>
            <AnnouncementsLayout />
        </SystemLayout>,
    children: [
        {
            path: '',
            element: <AnnouncementsPage />
        },
        {
            path: '*',
            element: <Navigate to='/announcements' />
        }
    ]
};

export default announcementsRouter;