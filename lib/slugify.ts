/**
 * Turns a course name like "B.Ed" or "Bachelor of Arts (BA)" into a URL slug.
 * Lowercases, replaces any run of non-alphanumeric characters with a single
 * hyphen, and trims leading/trailing hyphens.
 */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
