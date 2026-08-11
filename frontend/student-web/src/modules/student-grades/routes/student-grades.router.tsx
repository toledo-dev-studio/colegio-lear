import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router";
import { StudentGradesPage } from "../pages/StudentGradesPage";

const SystemLayout = lazy(() => import('@/layouts/SystemLayout'));
const StudentGradesLayout = lazy(() => import('@/modules/student-grades/layouts/StudentGradesLayout'));

export const studentGradesRouter: RouteObject = {
    path: '/grades',
    element:
        <AuthenticatedRoute>
            <SystemLayout>
                <StudentGradesLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: '',
            element: <StudentGradesPage />
        },
        {
            path: '*',
            element: <Navigate to='/dashboard' />
        }
    ]
}

export default studentGradesRouter;
