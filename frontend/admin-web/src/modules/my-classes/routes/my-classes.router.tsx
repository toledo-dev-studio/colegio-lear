import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router";
import { MyClassesPage } from "../pages/my-classes/MyClassesPage";

const SystemLayout = lazy(() => import("@/layouts/SystemLayout"));
const MyClassesLayout = lazy(() => import("@/modules/my-classes/layouts/MyClassesLayout"));
const MyClassLayout = lazy(() => import("@/modules/my-classes/layouts/MyClassLayout"));
const AttendanceTab = lazy(() => import("@/modules/my-classes/pages/my-class/attendance-tab/AttendanceTab"));

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
            element: <MyClassLayout />,
            children: [
                {
                    path: "",
                    element: <AttendanceTab />
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