import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { EmployeePage } from "../pages/employee/EmployeePage";
import { AuthenticatedRoute } from "@/routes/protected.router";
import { EmployeesPage } from "../pages/employees/EmployeesPage";

const SystemLayout = lazy(() => import("@/shared/layouts/SystemLayout"));
const EmployeesLayout = lazy(() => import("@/modules/employees/layouts/EmployeesLayout"));

export const employeesRouter: RouteObject = {
    path: "/employees",
    element:
        <AuthenticatedRoute moduleKey="employees">
            <SystemLayout>
                <EmployeesLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: "",
            element: <EmployeesPage />
        },
        {
            path: ":id",
            element: <EmployeePage />
        },
        {
            path: "*",
            element: <Navigate to="/employees" />
        }
    ]
};

export default employeesRouter;