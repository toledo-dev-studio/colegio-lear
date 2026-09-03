import { useEffect, type PropsWithChildren } from "react";
import { RouterProvider } from "react-router"
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "./shared/shadcn/ui/sonner";
import { appRouter } from "./routes/app.router";
import { TooltipProvider } from "./shared/shadcn/ui/tooltip";
import { useAuthStore } from "./stores/auth-store/auth.store";
import { ThemeContextProvider } from "./contexts/ThemeContext";
import { LoaderContextProvider } from "./contexts/LoaderContext";
import { queryClient } from "@/lib/query-client";

const AuthProvider = ({ children }: PropsWithChildren) => {
  const authStatus = useAuthStore((state) => state.authStatus);
  const checkAuthStatus = useAuthStore((state) => state.checkAuthStatus);

  // Validate authentication session on application bootstrap.
  // This runs on mount and whenever the reference of checkAuthStatus changes.
  // The backend is responsible for validating the session cookie.
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Return null because the global fullscreen loader
  // is already handled by useLoaderStore inside checkAuthStatus.
  if (authStatus === "checking")
    return null;

  return children;
}

export const App = () => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Toaster />

        {/* App context provider */}
        <ThemeContextProvider>

          {/* Loader context provider with Zustand */}
          <LoaderContextProvider>

            <TooltipProvider>

              {/* Validate authentication cookie */}
              <AuthProvider>
                <RouterProvider router={appRouter} />
              </AuthProvider>

            </TooltipProvider>

          </LoaderContextProvider>

          <ReactQueryDevtools initialIsOpen={false} />

        </ThemeContextProvider>

      </QueryClientProvider>
    </>
  )
}
