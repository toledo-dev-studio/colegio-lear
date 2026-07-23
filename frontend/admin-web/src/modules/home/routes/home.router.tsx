import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { HomePage } from "../pages/HomePage";
import { AuthenticatedRoute } from "@/routes/protected.router";

const SystemLayout = lazy(() => import('@/shared/layouts/SystemLayout'));
const HomeLayout = lazy(() => import('@/modules/home/layouts/HomeLayout'));

export const homeRouter: RouteObject = {
    path: '/home',
    element:
        <AuthenticatedRoute>
            <SystemLayout>
                <HomeLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: '',
            element: <HomePage />
        },
        {
            path: '*',
            element: <Navigate to='/home' />
        }
    ]
}

export default homeRouter;