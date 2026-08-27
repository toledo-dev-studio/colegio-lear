import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router";
import { MyClassesPage } from "../pages/my-classes/MyClassesPage";

const SystemLayout = lazy(() => import("@/layouts/SystemLayout"));
const MyClassesLayout = lazy(() => import("@/modules/my-classes/layouts/MyClassesLayout"));
const MyClassLayout = lazy(() => import("@/modules/my-classes/layouts/MyClassLayout"));

const CalendarTab = lazy(() => import("@/modules/my-classes/pages/my-class/calendar-tab/CalendarTab"));
const AttendanceTab = lazy(() => import("@/modules/my-classes/pages/my-class/attendance-tab/AttendanceTab"));
const SchoolSubjectsTab = lazy(() => import("@/modules/my-classes/pages/my-class/school-subjects-tab/SchoolSubjectsTab"));
const ChatsTab = lazy(() => import("@/modules/my-classes/pages/my-class/chats-tab/ChatsTab"));
const SchoolSubjectGradesPage = lazy(() => import("@/modules/my-classes/pages/my-class/school-subject-grades/SchoolSubjectGradesPage"));

export const myClassesRouter: RouteObject = {
    path: "/my-classes",
    element:
        <AuthenticatedRoute moduleKey="my-classes">
            <SystemLayout>
                <MyClassesLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: "",
            element: <MyClassesPage />
        },
        {
            path: ":id",
            children: [
                {
                    element: <MyClassLayout />,
                    children: [
                        {
                            path: "",
                            element: <CalendarTab />
                        },
                        {
                            path: "attendance",
                            element: <AttendanceTab />
                        },
                        {
                            path: "school-subjects",
                            element: <SchoolSubjectsTab />
                        },
                        {
                            path: "chats",
                            element: <ChatsTab />
                        },
                    ]
                },
                {
                    path: "school-subjects/:subjectId/grades",
                    element: <SchoolSubjectGradesPage />
                }
            ]
        },
        {
            path: "*",
            element: <Navigate to="/my-classes" />
        }
    ]
};

export default myClassesRouter;