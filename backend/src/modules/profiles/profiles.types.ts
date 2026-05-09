/**
 * TypeScript interfaces for the profiles module.
 * These types define the shape of data flowing through the profiles service layer.
 */

/** Input for creating a new profile */
export interface CreateProfileInput {
  name: string;
  description?: string;
}

/** Input for updating an existing profile (all fields optional) */
export interface UpdateProfileInput {
  name?: string;
  description?: string;
}

/** Privilege detail nested inside a profile response */
export interface PrivilegeDetail {
  id: number;
  action: string;
  moduleReference: {
    id: number;
    name: string;
  };
}

/** Profile data returned by the API */
export interface ProfileResponse {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  privileges: PrivilegeDetail[];
}

/** Privileges grouped by module name — keys are module names, values are action arrays */
export type PrivilegesByModule = Record<string, string[]>;

/** Input for assigning a privilege to a profile */
export interface AssignPrivilegeInput {
  moduleRef: string;
  action: "create" | "read" | "update" | "delete";
}

/** Input for removing a privilege from a profile */
export interface RemovePrivilegeInput {
  moduleRef: string;
  action: "create" | "read" | "update" | "delete";
}
