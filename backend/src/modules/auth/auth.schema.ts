import { z } from "zod";

/** Schema for login request body */
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

/** Schema for refresh token request body */
export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

/** Schema for assigning a profile to an employee */
export const assignProfileSchema = z.object({
  employeeId: z
    .number()
    .int()
    .positive("Employee ID must be a positive integer"),
  profileId: z.number().int().positive("Profile ID must be a positive integer"),
});
