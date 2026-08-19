/** Attachment view embedded in a material — material.id doubles as attachment.id (strict 1:1, no separate table). */
export interface SchoolSubjectMaterialAttachmentRecord {
  id: string;
  url: string;
  name: string;
  extension: string;
  relatedRecordId: string;
}

/** Record returned from the school_subject_materials table */
export interface SchoolSubjectMaterialRecord {
  id: string;
  academicCycleId: string;
  academicCycleSchoolGroupId: string;
  academicCycleSchoolSubjectId: string;
  attachment: SchoolSubjectMaterialAttachmentRecord;
}

/** File upload data passed from controller to service */
export interface FileUpload {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}
