import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router";
import { SecurityRolePage } from "../pages/security-role/SecurityRolePage";
import { SecurityRolesPage } from "../pages/security-roles/SecurityRolesPage";

const SystemLayout = lazy(() => import("@/shared/layouts/SystemLayout"));
const SecurityRolesLayout = lazy(() => import("@/modules/security-roles/layouts/SecurityRolesLayout"));

export const securityRolesRouter: RouteObject = {
    path: "/security-roles",
    element:
        <AuthenticatedRoute moduleKey="security-roles">
            <SystemLayout>
                <SecurityRolesLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: "",
            element: <SecurityRolesPage />
        },
        {
            path: ":id",
            element: <SecurityRolePage />
        },
        {
            path: "*",
            element: <Navigate to="/security-roles" />
        }
    ]
}

export default securityRolesRouter;