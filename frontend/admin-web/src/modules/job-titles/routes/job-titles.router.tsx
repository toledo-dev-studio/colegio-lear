import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { JobTitlePage } from "../pages/job-title/JobTitlePage";
import { AuthenticatedRoute } from "@/routes/protected.router";
import { JobTitlesPage } from "../pages/job-titles/JobTitlesPage";

const SystemLayout = lazy(() => import("@/shared/layouts/SystemLayout"));
const JobTitlesLayout = lazy(() => import("@/modules/job-titles/layouts/JobTitlesLayout"));

export const jobTitlesRouter: RouteObject = {
    path: "/job-titles",
    element:
        <AuthenticatedRoute moduleKey="job-titles">
            <SystemLayout>
                <JobTitlesLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: "",
            element: <JobTitlesPage />
        },
        {
            path: ":id",
            element: <JobTitlePage />
        },
        {
            path: "*",
            element: <Navigate to="/job-titles" />
        }
    ]
}

export default jobTitlesRouter;