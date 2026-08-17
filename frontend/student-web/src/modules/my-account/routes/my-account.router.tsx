import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router";
import { MyAccountPage } from "../pages/MyAccountPage";

const SystemLayout = lazy(() => import('@/layouts/SystemLayout'));
const MyAccountLayout = lazy(() => import('@/modules/my-account/layouts/MyAccountLayout'));

export const myAccountRouter: RouteObject = {
    path: '/my-account',
    element:
        <AuthenticatedRoute>
            <SystemLayout>
                <MyAccountLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: '',
            element: <MyAccountPage />
        },
        {
            path: '*',
            element: <Navigate to='/dashboard' />
        }
    ]
}

export default myAccountRouter;