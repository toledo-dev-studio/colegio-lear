import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { DashboardPage } from "../pages/DashboardPage";
import { AuthenticatedRoute } from "@/routes/protected.router";

const SystemLayout = lazy(() => import('@/layouts/SystemLayout'));
const DashboardLayout = lazy(() => import('@/modules/dashboard/layouts/DashboardLayout'));

export const dashboardRouter: RouteObject = {
    path: '/dashboard',
    element:
        <AuthenticatedRoute moduleKey="dashboard">
            <SystemLayout>
                <DashboardLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: '',
            element: <DashboardPage />
        },
        {
            path: '*',
            element: <Navigate to='/dashboard' />
        }
    ]
}

export default dashboardRouter;