import { ReactNode } from "react";
import { ShieldAlert } from "lucide-react";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { Card, PageHeader } from "@/components/admin/ui";

/**
 * Server-side gate for Super Admin-only sections (Courses, Masters, Admin Users).
 * A plain Admin typing the URL directly gets this notice instead of the page.
 * The matching API routes enforce the same permission independently, so this is
 * a UX guard rather than the security boundary.
 */
export async function RequireSuperAdmin({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  if (granted.has(PERMISSIONS.MANAGE_ADMIN_USERS)) {
    return <>{children}</>;
  }

  return (
    <div>
      <PageHeader title={title} />
      <Card className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-50">
          <ShieldAlert className="size-4 text-red-600" />
        </span>
        <div>
          <p className="text-sm font-medium text-[#1A1A1A]">Access denied</p>
          <p className="mt-0.5 text-sm text-[#6B7280]">
            This section is managed by a Super Admin. You can still create admissions, print forms
            and download documents from the Admissions section.
          </p>
        </div>
      </Card>
    </div>
  );
}
