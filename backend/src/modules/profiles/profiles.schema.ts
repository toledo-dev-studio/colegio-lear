import { z } from "zod";

/** Valid privilege actions */
const actionEnum = z.enum(["create", "read", "update", "delete"]);

/** Schema for creating a new profile */
export const createProfileSchema = z.object({
  name: z.string().min(1, "Profile name is required"),
  description: z.string().optional(),
});

/** Schema for updating an existing profile (all fields optional) */
export const updateProfileSchema = z.object({
  name: z.string().min(1, "Profile name is required").optional(),
  description: z.string().optional(),
});

/** Schema for assigning a privilege to a profile */
export const assignPrivilegeSchema = z.object({
  moduleRef: z.string().min(1, "Module reference is required"),
  action: actionEnum,
});

/** Schema for removing a privilege from a profile */
export const removePrivilegeSchema = z.object({
  moduleRef: z.string().min(1, "Module reference is required"),
  action: actionEnum,
});
