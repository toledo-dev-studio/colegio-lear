import multer from "multer";
import { ValidationError } from "../errors/app-error";

/**
 * Shared multer instance for single-image avatar uploads (employees,
 * students, ...). In-memory storage — the file is available as
 * req.file.buffer, which callers pass to IStorageService.upload().
 * Limits file size to 5MB and only allows image MIME types.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new ValidationError(
          "Only image files are allowed (jpeg, png, webp, gif)",
          [{ field: "file", message: "Only image files are allowed" }],
        ),
      );
    }
  },
});

/** Express middleware that parses a single `file` field from multipart/form-data. */
export const uploadAvatarSingle = upload.single("file");
