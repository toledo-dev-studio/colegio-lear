/**
 * TypeScript interfaces for the subjects module.
 * These types define the shape of data flowing through the service layer.
 */

/** Input for creating a new subject */
export interface CreateSubjectInput {
  name: string;
  description?: string;
}

/** Input for updating an existing subject (all fields optional) */
export interface UpdateSubjectInput {
  name?: string;
  description?: string;
}

/** Subject data returned by the API */
export interface SubjectResponse {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Grade-subject assignment data returned by the API */
export interface GradeSubjectResponse {
  id: number;
  gradeId: number;
  subjectId: number;
  createdAt: Date;
}
