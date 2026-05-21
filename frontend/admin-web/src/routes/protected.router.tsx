import { Navigate } from "react-router";
import { type PropsWithChildren } from "react"
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import type { ModuleKeys } from "@/interfaces/components/modules";

interface AuthenticatedRouteProps extends PropsWithChildren {
    moduleKey: ModuleKeys,
}

/**
 * Validate if a user is authenticated, if not return to login page.
 * @param param Children content for view.
 * @returns Children, null or redirect view depending auth status.
 */
export const AuthenticatedRoute = ({ moduleKey, children }: AuthenticatedRouteProps) => {
    const { authStatus, permissions } = useAuthStore();

    if (authStatus === "checking")
        return null;

    if (authStatus === "not-authenticated")
        return <Navigate to="/auth/login" />

    // If user is authenticated and has read permission to a module return the view
    if (authStatus === "authenticated" && permissions.some(permission => permission.moduleKey === moduleKey && permission.canRead))
        return children;

    // Check if user is authenticated and does not have any permission
    if (!permissions.length)
        return <Navigate to="/forbidden" />
}

/**
 * Validate if a user is already authenticated and tries to access to any to auth page.
 * @param param Children content for view.
 * @returns Children, null or redirect view depending auth status.
 */
export const NotAuthenticatedRoute = ({ children }: PropsWithChildren) => {
    const { authStatus } = useAuthStore();

    if (authStatus === "checking") return null;

    if (authStatus === "authenticated") return <Navigate to="/" />

    return children;
}

/**
 * Validate if a user does not have any permission to show Forbidden page.
 * @param param Children content for view.
 * @returns Children, null or redirect view depending user permissions.
 */
export const ForbiddenRoute = ({ children }: PropsWithChildren) => {
    const { permissions, authStatus } = useAuthStore();

    // Check if user is authenticated and does not have any permission
    if (!permissions.length && authStatus === "authenticated")
        return children;

    return <Navigate to="/dashboard" />;
}
