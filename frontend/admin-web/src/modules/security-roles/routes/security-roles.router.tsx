import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { SecurityRolesPage } from "../pages/security-roles/SecurityRolesPage";
import { SecurityRolePage } from "../pages/security-role/SecurityRolePage";

const SystemLayout = lazy(() => import('@/shared/layout/SystemLayout'));
const SecurityRolesLayout = lazy(() => import('@/modules/security-roles/layout/SecurityRolesLayout'));

export const securityRolesRouter: RouteObject = {
    path: '/security-roles',
    element:
        <SystemLayout>
            <SecurityRolesLayout />
        </SystemLayout>,
    children: [
        {
            path: '',
            element: <SecurityRolesPage />
        },
        {
            path: ':id',
            element: <SecurityRolePage />
        },
        {
            path: '*',
            element: <Navigate to='/security-roles' />
        }
    ]
}

export default securityRolesRouter;