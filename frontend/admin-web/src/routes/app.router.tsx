import { createBrowserRouter, Navigate, type RouteObject } from "react-router";

import authRouter from "@/modules/auth/routes/auth.router";
import { NotFoundPage } from "@/shared/pages/NotFoundPage";
import { ForbiddenRoute } from "./protected.router";
import { ForbiddenPage } from "@/shared/pages/ForbiddenPage";
import { RootLayout } from "./components/RootLayout";
import { Loader } from "@/shared/components/loader/Loader";

const lazyModuleRouters: Record<string, () => Promise<{ default: RouteObject }>> = {
    "/home": () => import("@/modules/home/routes/home.router"),
    "/dashboard": () => import("@/modules/dashboard/routes/dashboard.router"),
    "/my-account": () => import("@/modules/my-account/routes/my-account.router"),
    "/my-classes": () => import("@/modules/my-classes/routes/my-classes.router"),
    "/students": () => import("@/modules/students/routes/students.router"),
    "/academic-cycles": () => import("@/modules/academic-cycles/routes/academic-cycles.router"),
    "/announcements": () => import("@/modules/announcements/routes/announcements.router"),
    "/academic-levels": () => import("@/modules/academic-levels/routes/academic-levels.router"),
    "/school-subjects": () => import("@/modules/school-subjects/routes/school-subjects.router"),
    "/scholarships": () => import("@/modules/scholarships/routes/scholarships.router"),
    "/payment-concepts": () => import("@/modules/payment-concepts/routes/payment-concepts.router"),
    "/employees": () => import("@/modules/employees/routes/employees.router"),
    "/job-titles": () => import("@/modules/job-titles/routes/job-titles.router"),
    "/security-roles": () => import("@/modules/security-roles/routes/security-roles.router")
};

const loadedModuleRouters = new Set<string>();

export const appRouter = createBrowserRouter([
    {
        id: "root",
        element: <RootLayout />,
        hydrateFallbackElement: <Loader title="Cargando" />,
        children: [
            /** auth */
            ...authRouter,
            {
                path: "/",
                element: <Navigate to="/home" />
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
