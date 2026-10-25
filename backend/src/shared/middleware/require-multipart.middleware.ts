import { type RequestHandler } from "express";
import { ValidationError } from "../errors/app-error";

/**
 * Rejects requests whose Content-Type is not multipart/form-data.
 * Use on routes that accept an optional file upload (multer only parses
 * multipart bodies — anything else silently skips the file instead of
 * failing, which hides client-side bugs like sending a FormData instance
 * nested inside a JSON body instead of as the request body itself).
 */
export const requireMultipart: RequestHandler = (req, _res, next) => {
  if (!req.is("multipart/form-data")) {
    throw new ValidationError("El Content-Type debe ser multipart/form-data", [
      {
        field: "Content-Type",
        message: `Se esperaba multipart/form-data, se recibió "${req.headers["content-type"] ?? "none"}"`,
      },
    ]);
  }
  next();
};
