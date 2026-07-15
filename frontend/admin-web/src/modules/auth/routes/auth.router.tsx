import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { LoginPage } from "../pages/login/LoginPage";
import { ResetPasswordPage } from "../pages/reset-password/ResetPasswordPage";
import { ForgotPasswordPage } from "../pages/forgot-password/ForgotPasswordPage";
import { NotAuthenticatedRoute, PendingResetPasswordRoute } from "@/routes/protected.router";

const AuthLayout = lazy(() => import("@/modules/auth/layouts/AuthLayout"));

export const authRouter: RouteObject[] = [
    {
        path: "/auth",
        element:
            <NotAuthenticatedRoute>
                <AuthLayout />
            </NotAuthenticatedRoute>,
        children: [
            {
                index: true,
                element: <Navigate to="/auth/login" />
            },
            {
                path: "login",
                element: <LoginPage />
            },
            {
                path: "forgot-password",
                element: <ForgotPasswordPage />
            },
        ]
    },
    {
        path: "/auth/reset-password",
        element:
            <PendingResetPasswordRoute>
                <AuthLayout />
            </PendingResetPasswordRoute>,
        children: [
            {
                index: true,
                element: <ResetPasswordPage />
            }
        ]
    }
]

export default authRouter;