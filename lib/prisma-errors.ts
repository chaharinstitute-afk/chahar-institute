/**
 * True when the error is Prisma's unique-constraint violation (P2002).
 * Use this instead of treating every thrown error as a duplicate — a bare
 * `catch` would also swallow serialization bugs and report them as conflicts.
 */
export function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2002"
  );
}

/** True when Prisma could not find the record to update/delete (P2025). */
export function isRecordNotFoundError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2025"
  );
}
