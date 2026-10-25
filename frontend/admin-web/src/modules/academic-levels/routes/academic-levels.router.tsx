import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router";
import { AcademicLevelPage } from "../pages/academic-level/AcademicLevelPage";
import { AcademicLevelsPage } from "../pages/academic-levels/AcademicLevelsPage";

const SystemLayout = lazy(() => import("@/layouts/SystemLayout"));
const AcademicLevelsLayout = lazy(() => import("@/modules/academic-levels/layouts/AcademicLevelsLayout"));

export const academicLevelsRouter: RouteObject = {
    path: "/academic-levels",
    element:
        <AuthenticatedRoute moduleKey="academic-levels">
            <SystemLayout>
                <AcademicLevelsLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: "",
            element: <AcademicLevelsPage />
        },
        {
            path: ":id",
            element: <AcademicLevelPage />
        },
        {
            path: "*",
            element: <Navigate to="/academic-levels" />
        }
    ]
}

export default academicLevelsRouter;