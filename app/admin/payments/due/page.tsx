import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { DuePaymentsClient } from "./due-payments-client";

/**
 * Super Admin (view_all_admissions) sees every admission with an outstanding
 * balance, plus a "Filled By" filter/column to see which admin is handling
 * each student's admission. A plain Admin only sees their own — the API
 * route enforces this independently.
 */
export default async function DuePaymentsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  const canViewAll = granted.has(PERMISSIONS.VIEW_ALL_ADMISSIONS);

  return <DuePaymentsClient canViewAll={canViewAll} />;
}
