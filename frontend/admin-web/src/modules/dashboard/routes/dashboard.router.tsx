import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { DashboardPage } from "../pages/DashboardPage";

const SystemLayout = lazy(() => import('@/shared/layout/SystemLayout'));
const DashboardLayout = lazy(() => import('@/modules/dashboard/layout/DashboardLayout'));

export const dashboardRouter: RouteObject = {
    path: '/dashboard',
    element:
        <SystemLayout>
            <DashboardLayout />
        </SystemLayout>,
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