import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { StudentLayout } from "../layouts/StudentLayout";
import { StudentsPage } from "../pages/students/StudentsPage";
import { AuthenticatedRoute } from "@/routes/protected.router";
import { StudentTab } from "../pages/student/student-tab/StudentTab";
import { StudentGuardiansTab } from "../pages/student/student-guardians-tab/StudentGuardiansTab";
import { StudentAllergiesTab } from "../pages/student/student-allergies-tab/StudentAllergiesTab";
import { StudentAcademicCyclesTab } from "../pages/student/student-enrollments/StudentAcademicCyclesTab";

const SystemLayout = lazy(() => import("@/shared/layouts/SystemLayout"));
const StudentsLayout = lazy(() => import("@/modules/students/layouts/StudentsLayout"));

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
            element: <StudentLayout />,
            children: [
                {
                    index: true,
                    element: <StudentTab />
                },
                {
                    path: "allergies",
                    element: <StudentAllergiesTab />
                },
                {
                    path: "guardians",
                    element: <StudentGuardiansTab />
                },
                {
                    path: "academic-cycles",
                    element: <StudentAcademicCyclesTab />
                }
            ]
        },
        {
            path: "*",
            element: <Navigate to="/students" />
        }
    ]
}

export default studentsRouter;