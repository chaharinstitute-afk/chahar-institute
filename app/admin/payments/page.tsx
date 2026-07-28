import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { PaymentHistoryClient } from "./payment-history-client";

/**
 * Super Admin (view_all_admissions) sees every submission and gets a
 * "Submitted By" filter to see exactly which admin recorded a payment on
 * behalf of a student. A plain Admin only ever sees submissions against
 * admissions they created — the API route enforces this independently.
 */
export default async function PaymentHistoryPage() {
  const session = await auth();
  if (!session?.user) return null;

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  const canViewAll = granted.has(PERMISSIONS.VIEW_ALL_ADMISSIONS);

  return <PaymentHistoryClient canViewAll={canViewAll} />;
}
