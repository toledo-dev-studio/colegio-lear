import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";
import { PaymentConceptsPage } from "../pages/payment-concepts/PaymentConceptsPage";
import { PaymentConceptPage } from "../pages/payment-concept/PaymentConceptPage";

const SystemLayout = lazy(() => import('@/shared/layout/SystemLayout'));
const PaymentConceptsLayout = lazy(() => import('@/modules/payment-concepts/layout/PaymentConceptsLayout'));

export const paymentConceptsRouter: RouteObject = {
    path: '/payment-concepts',
    element:
        <SystemLayout>
            <PaymentConceptsLayout />
        </SystemLayout>,
    children: [
        {
            path: '',
            element: <PaymentConceptsPage />
        },
        {
            path: ':id',
            element: <PaymentConceptPage />
        },
        {
            path: '*',
            element: <Navigate to='/payment-concepts' />
        }
    ]
}

export default paymentConceptsRouter;
