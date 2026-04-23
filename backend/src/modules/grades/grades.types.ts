/**
 * TypeScript interfaces for the grades module.
 * These types define the shape of data flowing through the service layer.
 */

/** Input for creating a new grade */
export interface CreateGradeInput {
  name: string;
  educationLevelId: number;
  description?: string;
  order?: number;
}

/** Input for updating an existing grade (all fields optional) */
export interface UpdateGradeInput {
  name?: string;
  description?: string;
  order?: number;
}

/** Grade data returned by the API */
export interface GradeResponse {
  id: number;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  educationLevelId: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Grade detail response — includes parent education level and count of associated groups */
export interface GradeDetailResponse extends GradeResponse {
  educationLevel: {
    id: number;
    name: string;
  };
  _count: {
    groups: number;
  };
}
