/**
 * TypeScript interfaces for the groups module.
 * These types define the shape of data flowing through the service layer.
 */

/** Input for creating a new group */
export interface CreateGroupInput {
  name: string;
  gradeId: number;
}

/** Input for updating an existing group (all fields optional) */
export interface UpdateGroupInput {
  name?: string;
}

/** Group data returned by the API */
export interface GroupResponse {
  id: number;
  name: string;
  isActive: boolean;
  gradeId: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Group detail response — includes parent grade and its education level */
export interface GroupDetailResponse extends GroupResponse {
  grade: {
    id: number;
    name: string;
    educationLevel: {
      id: number;
      name: string;
    };
  };
}
