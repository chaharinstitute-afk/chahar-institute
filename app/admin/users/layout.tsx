import { ReactNode } from "react";
import { RequireSuperAdmin } from "@/components/admin/require-super-admin";

export default function UsersLayout({ children }: { children: ReactNode }) {
  return <RequireSuperAdmin title="Admin Users">{children}</RequireSuperAdmin>;
}
