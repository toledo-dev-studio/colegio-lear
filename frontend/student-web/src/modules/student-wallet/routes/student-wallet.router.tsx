import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router";
import { StudentWalletPage } from "../pages/StudentWalletPage";

const SystemLayout = lazy(() => import('@/layouts/SystemLayout'));
const StudentWalletLayout = lazy(() => import('@/modules/student-wallet/layouts/StudentWalletLayout'));

export const studentWalletRouter: RouteObject = {
    path: '/wallet',
    element:
        <AuthenticatedRoute>
            <SystemLayout>
                <StudentWalletLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: '',
            element: <StudentWalletPage />
        },
        {
            path: '*',
            element: <Navigate to='/dashboard' />
        }
    ]
}

export default studentWalletRouter;