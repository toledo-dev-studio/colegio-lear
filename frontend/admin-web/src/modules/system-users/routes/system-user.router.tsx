import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { SystemUsersPage } from "../pages/system-users/SystemUsersPage";

const SystemLayout = lazy(() => import('@/shared/layout/SystemLayout'));
const SystemUsersLayout = lazy(() => import('@/modules/system-users/layout/SystemUsersLayout'));

export const systemUserRouter: RouteObject = {
    path: '/system-users',
    element:
        <SystemLayout>
            <SystemUsersLayout />
        </SystemLayout>,
    children: [
        {
            path: '',
            element: <SystemUsersPage />
        },
        {
            path: '*',
            element: <Navigate to='/system-users' />
        }
    ]
};

export default systemUserRouter;