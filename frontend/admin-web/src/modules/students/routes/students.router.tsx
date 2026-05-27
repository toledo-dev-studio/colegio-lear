import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { StudentPage } from "../pages/student/StudentPage";
import { StudentsPage } from "../pages/students/StudentsPage";
import { AuthenticatedRoute } from "@/routes/protected.router";

const SystemLayout = lazy(() => import("@/shared/layout/SystemLayout"));
const StudentsLayout = lazy(() => import("@/modules/students/layout/StudentsLayout"));

export const studentsRouter: RouteObject = {
    path: "/students",
    element:
        <AuthenticatedRoute moduleKey="students">
            <SystemLayout>
                <StudentsLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: "",
            element: <StudentsPage />
        },
        {
            path: ":id",
            element: <StudentPage />
        },
        {
            path: "*",
            element: <Navigate to="/students" />
        }
    ]
}

export default studentsRouter;