import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router";
import { AnnouncementPage } from "../pages/announcement/AnnouncementPage";
import { AnnouncementsPage } from "../pages/announcements/AnnouncementsPage";

const SystemLayout = lazy(() => import("@/layouts/SystemLayout"));
const AnnouncementsLayout = lazy(() => import("@/modules/announcements/layouts/AnnouncementsLayout"));

export const announcementsRouter: RouteObject = {
    path: "/announcements",
    element:
        <AuthenticatedRoute moduleKey="announcements">
            <SystemLayout>
                <AnnouncementsLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: "",
            element: <AnnouncementsPage />
        },
        {
            path: ":id",
            element: <AnnouncementPage />
        },
        {
            path: "*",
            element: <Navigate to="/announcements" />
        }
    ]
};

export default announcementsRouter;