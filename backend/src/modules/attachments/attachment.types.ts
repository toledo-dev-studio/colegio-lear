/** Record returned from the attachments table */
export interface AttachmentRecord {
  id: string;
  url: string;
  name: string;
  extension: string;
  relatedRecordId: string;
}

/** File upload data passed from controller to service */
export interface FileUpload {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}
