import { ReactNode } from "react";
import { MastersTabs } from "@/components/admin/masters-tabs";
import { RequireSuperAdmin } from "@/components/admin/require-super-admin";
import { PageHeader } from "@/components/admin/ui";

export default function MastersLayout({ children }: { children: ReactNode }) {
  return (
    <RequireSuperAdmin title="Masters">
      <div>
        <PageHeader title="Masters" subtitle="Reference data used across admission forms" />
        <MastersTabs />
        {children}
      </div>
    </RequireSuperAdmin>
  );
}
