import { prisma } from "@/lib/prisma";

/** Permission keys used across the admin panel. Keep in sync with prisma/seed.ts */
export const PERMISSIONS = {
  MANAGE_ADMIN_USERS: "manage_admin_users",
  MANAGE_COURSES: "manage_courses",
  MANAGE_UNIVERSITIES: "manage_universities",
  MANAGE_ADMISSION_SESSIONS: "manage_admission_sessions",
  MANAGE_MASTERS: "manage_masters",
  MANAGE_LEADS: "manage_leads",
  MANAGE_SETTINGS: "manage_settings",
  MANAGE_FORMS: "manage_forms",
  VIEW_REPORTS: "view_reports",
  VIEW_ALL_ADMISSIONS: "view_all_admissions",
  DELETE_ADMISSIONS: "delete_admissions",
  CREATE_ADMISSION: "create_admission",
  EDIT_ADMISSION: "edit_admission",
  UPLOAD_DOCUMENTS: "upload_documents",
  SUBMIT_ADMISSION: "submit_admission",
  PRINT_ADMISSION_FORM: "print_admission_form",
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/**
 * Returns the set of permission keys granted to a role.
 */
export async function getPermissionsForRole(roleId: bigint): Promise<Set<string>> {
  const rolePermissions = await prisma.rolePermission.findMany({
    where: { roleId },
    include: { permission: true },
  });
  return new Set(rolePermissions.map((rp) => rp.permission.key));
}

/**
 * Throws if the given set of permissions does not include the required key.
 * Use inside Route Handlers / Server Actions after resolving the session's role.
 */
export function assertPermission(
  granted: Set<string>,
  required: PermissionKey
): void {
  if (!granted.has(required)) {
    throw new Error(`Forbidden: missing permission "${required}"`);
  }
}
