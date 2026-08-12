import { createBrowserRouter, Navigate } from "react-router";

import { ForbiddenRoute } from "./protected.router";
import authRouter from "@/modules/auth/routes/auth.router";
import { NotFoundPage } from "@/shared/pages/NotFoundPage";
import { ForbiddenPage } from "@/shared/pages/ForbiddenPage";
import dashboardRouter from "@/modules/dashboard/routes/dashboard.router";
import studentWalletRouter from "@/modules/student-wallet/routes/student-wallet.router";
import studentGradesRouter from "@/modules/student-grades/routes/student-grades.router";
import calendarRouter from "@/modules/calendar/routes/calendar.router";
import chatsRouter from "@/modules/chats/routes/chats.router";
import subjectsRouter from "@/modules/subjects/routes/subjects.router";

export const appRouter = createBrowserRouter([
    /** Auth routes */
    ...authRouter,

    /** Site Modules */
    dashboardRouter,
    studentWalletRouter,
    studentGradesRouter,
    calendarRouter,
    chatsRouter,
    subjectsRouter,
    
    /** Root page */
    {
        path: "/",
        element: <Navigate to="/dashboard" />
    },
    
    /** Forbidden page */
    {
        path: "forbidden",
        element:
            <ForbiddenRoute>
                <ForbiddenPage />
            </ForbiddenRoute>
    },
    
    /** 404 not found page */
    {
        path: '*',
        element: <NotFoundPage />
    }
]);
