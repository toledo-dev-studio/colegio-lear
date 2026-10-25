import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router";
import { PaymentConceptPage } from "../pages/payment-concept/PaymentConceptPage";
import { PaymentConceptsPage } from "../pages/payment-concepts/PaymentConceptsPage";

const SystemLayout = lazy(() => import("@/layouts/SystemLayout"));
const PaymentConceptsLayout = lazy(() => import("@/modules/payment-concepts/layouts/PaymentConceptsLayout"));

export const paymentConceptsRouter: RouteObject = {
    path: "/payment-concepts",
    element:
        <AuthenticatedRoute moduleKey="payment-concepts">
            <SystemLayout>
                <PaymentConceptsLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: "",
            element: <PaymentConceptsPage />
        },
        {
            path: ":id",
            element: <PaymentConceptPage />
        },
        {
            path: "*",
            element: <Navigate to="/payment-concepts" />
        }
    ]
}

export default paymentConceptsRouter;
