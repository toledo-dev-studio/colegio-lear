import { createBrowserRouter, Navigate } from "react-router";

import { ForbiddenRoute } from "./protected.router";
import authRouter from "@/modules/auth/routes/auth.router";
import { NotFoundPage } from "@/shared/pages/NotFoundPage";
import { ForbiddenPage } from "@/shared/pages/ForbiddenPage";
import dashboardRouter from "@/modules/dashboard/routes/dashboard.router";

export const appRouter = createBrowserRouter([
    /** auth */
    ...authRouter,
    dashboardRouter,
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
