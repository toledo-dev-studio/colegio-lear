/**
 * This file manage all the environment variables constants to use it in the application.
 */
export const VITE_API_URL: string = import.meta.env.VITE_API_URL;
export const VITE_ENVIRONMENT: "mockable" | "development" | "production" = import.meta.env.VITE_ENVIRONMENT;
export const IS_MOCKABLE = VITE_ENVIRONMENT === "mockable";
