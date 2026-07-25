import { ReactNode } from "react";
import { RequireSuperAdmin } from "@/components/admin/require-super-admin";

export default function LeadsLayout({ children }: { children: ReactNode }) {
  return <RequireSuperAdmin title="Leads">{children}</RequireSuperAdmin>;
}
