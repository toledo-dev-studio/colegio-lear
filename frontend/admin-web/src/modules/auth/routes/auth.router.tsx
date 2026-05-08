import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { LoginPage } from "../pages/login/LoginPage";
import { ForgotPassword } from "../pages/forgot-password/ForgotPassword";

const AuthLayout = lazy(() => import('@/modules/auth/layout/AuthLayout'));

export const authRouter: RouteObject = {
    path: '/auth',
    element: <AuthLayout />,
    children: [
        {
            index: true,
            element: <Navigate to='/auth/login' />
        },
        {
            path: 'login',
            element: <LoginPage />
        },
        {
            path: 'forgot-password',
            element: <ForgotPassword />
        }
    ]
}

export default authRouter;