/**
 * TypeScript interfaces for the education-levels module.
 * These types define the shape of data flowing through the service layer.
 */

/** Input for creating a new education level */
export interface CreateEducationLevelInput {
  name: string;
  description?: string;
  order?: number;
}

/** Input for updating an existing education level (all fields optional) */
export interface UpdateEducationLevelInput {
  name?: string;
  description?: string;
  order?: number;
}

/** Education level data returned by the API */
export interface EducationLevelResponse {
  id: number;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Education level detail response — includes count of associated grades */
export interface EducationLevelDetailResponse extends EducationLevelResponse {
  _count: {
    grades: number;
  };
}
