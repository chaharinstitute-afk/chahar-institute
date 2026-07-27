import { ReactNode } from "react";
import { RequireSuperAdmin } from "@/components/admin/require-super-admin";

export default function BusinessPartnersLayout({ children }: { children: ReactNode }) {
  return <RequireSuperAdmin title="Business Partners">{children}</RequireSuperAdmin>;
}
