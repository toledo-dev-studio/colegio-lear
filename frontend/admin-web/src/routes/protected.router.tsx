import { Navigate, useLocation } from "react-router";
import { type PropsWithChildren } from "react"
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import type { ModuleKey } from "@/lib/key-value-pairs/key-value-pair-modules";

interface AuthenticatedRouteProps extends PropsWithChildren {
    moduleKey?: ModuleKey,
}

/**
 * Validate if a user is authenticated, if not return to login page.
 * @param param Children content for view.
 * @returns Children, null or redirect view depending auth status.
 */
export const AuthenticatedRoute = ({ moduleKey, children }: AuthenticatedRouteProps) => {
    const location = useLocation();
    const { authStatus, user, permissions } = useAuthStore();

    if (authStatus === "checking")
        return null;

    if (authStatus === "not-authenticated")
        return <Navigate to="/auth/login" />

    // If user is authenticated but the password were reset before login
    if (authStatus === "authenticated" && user?.mustChangePassword === true)
        return <Navigate to="/auth/reset-password" />;

    // Check if user is authenticated and does not have any permission
    if (!permissions.some(permission => permission.canRead))
        return <Navigate to="/forbidden" />

    // If user is authenticated and try to access to /home return the view 
    if (authStatus === "authenticated" && location.pathname === "/home")
        return children;
    
    // If user is authenticated and has read permission to a module return the view
    if (authStatus === "authenticated" && permissions.some(permission => permission.moduleKey === moduleKey && permission.canRead))
        return children;

    // If user is authenticated and has read permission for others module except dashboard, redirect to first one
    const firstModule = permissions.find(permission => permission.canRead);
    return <Navigate to={`/${firstModule?.moduleKey ?? "forbidden"}`} />
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

/**
 * Validate if a user has pending reset password.
 * @param param Children content for view.
 * @returns Children, null or redirect view depending user permissions.
 */
export const PendingResetPasswordRoute = ({ children }: PropsWithChildren) => {
    const { authStatus, user } = useAuthStore();

    // If user is authenticated but the password were reset before login
    if (authStatus === "authenticated" && user?.mustChangePassword === true)
        return children;

    return <Navigate to="/dashboard" />;
}