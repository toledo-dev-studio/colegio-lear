import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router";
import { SchoolSubjectPage } from "../pages/school-subject/SchoolSubjectPage";
import { SchoolSubjectsPage } from "../pages/school-subjects/SchoolSubjectsPage";

const SystemLayout = lazy(() => import("@/shared/layouts/SystemLayout"));
const SchoolSubjectsLayout = lazy(() => import("@/modules/school-subjects/layout/SchoolSubjectsLayout"));

export const schoolSubjectsRouter: RouteObject = {
    path: "/school-subjects",
    element:
        <AuthenticatedRoute moduleKey="school-subjects">
            <SystemLayout>
                <SchoolSubjectsLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: "",
            element: <SchoolSubjectsPage />
        },
        {
            path: ":id",
            element: <SchoolSubjectPage />
        },
        {
            path: "*",
            element: <Navigate to="/school-subjects" />
        }
    ]
};

export default schoolSubjectsRouter;