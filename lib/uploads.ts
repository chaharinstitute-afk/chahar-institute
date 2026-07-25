import { mkdir, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Files are stored outside the Next.js public directory so they are never
// directly web-accessible — the admin panel serves them through an authenticated
// route handler instead. See admin/ADMIN_PANEL_PLAN.md, "File uploads" section.
// turbopackIgnore: process.cwd() here is a runtime file-system root, not a static
// import — without the ignore comment Turbopack tries to trace the entire project.
const UPLOADS_ROOT = path.resolve(
  /* turbopackIgnore: true */ process.cwd(),
  process.env.UPLOADS_DIR || "./uploads"
);

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export class UploadValidationError extends Error {}

/**
 * Validates and saves an uploaded file to disk under a per-student subfolder.
 * Returns the relative path (relative to UPLOADS_ROOT) to store in the DB —
 * never store the absolute filesystem path.
 */
export async function saveUploadedFile(file: File, studentId: string): Promise<string> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new UploadValidationError(
      "Unsupported file type. Allowed: JPG, PNG, WEBP, PDF."
    );
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new UploadValidationError("File is too large. Maximum size is 5MB.");
  }

  const studentDir = path.join(UPLOADS_ROOT, "students", studentId);
  await mkdir(studentDir, { recursive: true });

  const ext = path.extname(file.name).toLowerCase() || guessExtension(file.type);
  const safeName = `${crypto.randomUUID()}${ext}`;
  const absolutePath = path.join(studentDir, safeName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  return path.join("students", studentId, safeName);
}

function guessExtension(mimeType: string): string {
  switch (mimeType) {
    case "image/jpeg":
    case "image/jpg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "application/pdf":
      return ".pdf";
    default:
      return "";
  }
}

export function resolveUploadPath(relativePath: string): string {
  // Prevent path traversal — resolve then verify the result is still inside UPLOADS_ROOT.
  const resolved = path.resolve(UPLOADS_ROOT, relativePath);
  if (!resolved.startsWith(UPLOADS_ROOT)) {
    throw new UploadValidationError("Invalid file path.");
  }
  return resolved;
}
