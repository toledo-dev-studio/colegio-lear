import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";
import { MyAccountPage } from "../pages/MyAccountPage";

const SystemLayout = lazy(() => import('@/shared/layout/SystemLayout'));
const MyAccountLayout = lazy(() => import('@/modules/my-account/layout/MyAccountLayout'));

export const myAccountRouter: RouteObject = {
    path: '/my-account',
    element:
        <SystemLayout>
            <MyAccountLayout />
        </SystemLayout>,
    children: [
        {
            path: '',
            element: <MyAccountPage />
        },
        {
            path: '*',
            element: <Navigate to='/my-account' />
        }
    ]
}

export default myAccountRouter;
