import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { EmployeePage } from "../pages/employee/EmployeePage";
import { EmployeesPage } from "../pages/employees/EmployeesPage";

const SystemLayout = lazy(() => import('@/shared/layout/SystemLayout'));
const EmployeesLayout = lazy(() => import('@/modules/employees/layout/EmployeesLayout'));

export const employeesRouter: RouteObject = {
    path: '/employees',
    element:
        <SystemLayout>
            <EmployeesLayout />
        </SystemLayout>,
    children: [
        {
            path: '',
            element: <EmployeesPage />
        },
        {
            path: ':id',
            element: <EmployeePage />
        },
        {
            path: '*',
            element: <Navigate to='/employees' />
        }
    ]
};

export default employeesRouter;