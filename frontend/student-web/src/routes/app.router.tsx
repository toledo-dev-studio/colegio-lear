import { createBrowserRouter, Navigate, type RouteObject } from "react-router";

import authRouter from "@/modules/auth/routes/auth.router";
import { NotFoundPage } from "@/shared/pages/NotFoundPage";
import { ForbiddenRoute } from "./protected.router";
import { ForbiddenPage } from "@/shared/pages/ForbiddenPage";
import { RootLayout } from "./components/RootLayout";
import { Loader } from "@/shared/components/loader/Loader";

const lazyModuleRouters: Record<string, () => Promise<{ default: RouteObject }>> = {
    "/dashboard": () => import("@/modules/dashboard/routes/dashboard.router"),
    "/wallet": () => import("@/modules/student-wallet/routes/student-wallet.router"),
    "/grades": () => import("@/modules/student-grades/routes/student-grades.router"),
    "/school-calendar": () => import("@/modules/calendar/routes/calendar.router"),
    "/chats": () => import("@/modules/chats/routes/chats.router"),
    "/subjects": () => import("@/modules/subjects/routes/subjects.router"),
    "/my-account": () => import("@/modules/my-account/routes/my-account.router"),
    "/attendance": () => import("@/modules/attendance/routes/attendance.router")
};

const loadedModuleRouters = new Set<string>();

export const appRouter = createBrowserRouter([
    {
        id: "root",
        element: <RootLayout />,
        hydrateFallbackElement: <Loader title="Cargando" />,
        children: [
            /** Auth routes */
            ...authRouter,

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
        ]
    }
], {
    async patchRoutesOnNavigation({ patch, path }) {
        const firstSegment = "/" + path.split("/")[1];
        const loadModuleRouter = lazyModuleRouters[firstSegment];
        if (!loadModuleRouter || loadedModuleRouters.has(firstSegment))
            return;
        const { default: moduleRouter } = await loadModuleRouter();
        loadedModuleRouters.add(firstSegment);
        patch("root", [moduleRouter]);
    }
});
