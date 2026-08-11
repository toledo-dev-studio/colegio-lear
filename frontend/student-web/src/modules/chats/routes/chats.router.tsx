import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router";

import { AuthenticatedRoute } from "@/routes/protected.router";
import { ChatsPage } from "../pages/ChatsPage";

const SystemLayout = lazy(() => import('@/layouts/SystemLayout'));
const ChatsLayout = lazy(() => import('@/modules/chats/layouts/ChatsLayout'));

export const chatsRouter: RouteObject = {
    path: '/messages',
    element:
        <AuthenticatedRoute>
            <SystemLayout>
                <ChatsLayout />
            </SystemLayout>
        </AuthenticatedRoute>,
    children: [
        {
            path: '',
            element: <ChatsPage />
        },
        {
            path: '*',
            element: <Navigate to='/dashboard' />
        }
    ]
}

export default chatsRouter;