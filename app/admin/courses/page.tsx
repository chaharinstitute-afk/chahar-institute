import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { CoursesClient } from "./courses-client";

/**
 * Super Admin gets full manage access (add/edit/delete/toggle status).
 * Admin gets a read-only view of the same list — can see every course and
 * its full details (fees, documents, careers, FAQs) but no write controls.
 * The API routes independently enforce manage_courses for any write action,
 * so this is a UX distinction, not the security boundary.
 */
export default async function CoursesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  const canManage = granted.has(PERMISSIONS.MANAGE_COURSES);

  return <CoursesClient canManage={canManage} />;
}
