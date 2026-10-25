import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router";
import { CalendarPage } from "../pages/CalendarPage";

const SystemLayout = lazy(() => import('@/layouts/SystemLayout'));
const CalendarLayout = lazy(() => import('@/modules/calendar/layouts/CalendarLayout'));

export const calendarRouter: RouteObject = {
    path: '/school-calendar',
    element:
        <AuthenticatedRoute>
            <SystemLayout>
                <CalendarLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: '',
            element: <CalendarPage />
        },
        {
            path: '*',
            element: <Navigate to='/dashboard' />
        }
    ]
}

export default calendarRouter;