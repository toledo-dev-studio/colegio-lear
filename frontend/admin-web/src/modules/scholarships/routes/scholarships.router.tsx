import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router";
import { ScholarshipPage } from "../pages/scholarship/ScholarshipPage";
import { ScholarshipsPage } from "../pages/scholarships/ScholarshipsPage";

const SystemLayout = lazy(() => import("@/shared/layout/SystemLayout"));
const ScholarshipsLayout = lazy(() => import("@/modules/scholarships/layout/ScholarshipsLayout"));

export const scholarshipsRouter: RouteObject = {
    path: "/scholarships",
    element:
        <AuthenticatedRoute moduleKey="scholarships">
            <SystemLayout>
                <ScholarshipsLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: "",
            element: <ScholarshipsPage />
        },
        {
            path: ":id",
            element: <ScholarshipPage />
        },
        {
            path: "*",
            element: <Navigate to="/scholarships" />
        }
    ]
}

export default scholarshipsRouter;