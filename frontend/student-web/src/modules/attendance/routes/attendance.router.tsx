import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router";
import { AttendancePage } from "../pages/AttendancePage";

const SystemLayout = lazy(() => import('@/layouts/SystemLayout'));
const AttendanceLayout = lazy(() => import('@/modules/attendance/layouts/AttendanceLayout'));

export const attendanceRouter: RouteObject = {
    path: '/attendance',
    element:
        <AuthenticatedRoute>
            <SystemLayout>
                <AttendanceLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: '',
            element: <AttendancePage />
        },
        {
            path: '*',
            element: <Navigate to='/dashboard' />
        }
    ]
}

export default attendanceRouter;
