/** Record returned from the school_subject_task_attachments table */
export interface SchoolSubjectTaskAttachmentRecord {
  id: string;
  url: string;
  name: string;
  extension: string;
  relatedRecordId: string;
}

/** Record returned from the school_subject_tasks table */
export interface SchoolSubjectTaskRecord {
  id: string;
  academicCycleId: string;
  academicCycleSchoolGroupId: string;
  academicCycleSchoolSubjectId: string;
  title: string;
  description: string | null;
  dueDate: string;
  createdAt: string;
  attachments: SchoolSubjectTaskAttachmentRecord[];
}

/** Input DTO for creating a school subject task */
export interface CreateSchoolSubjectTaskDto {
  title: string;
  description?: string;
  dueDate: string;
}

/** Input DTO for updating a school subject task */
export interface UpdateSchoolSubjectTaskDto {
  title?: string;
  description?: string | null;
  dueDate?: string;
}

/** File upload data passed from controller to service */
export interface FileUpload {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

/** Result of a paginated query */
export interface PagedResult<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  itemsCount: number;
}
