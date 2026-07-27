import { ReactNode } from "react";
import { RequireSuperAdmin } from "@/components/admin/require-super-admin";

export default function PaymentMethodsLayout({ children }: { children: ReactNode }) {
  return <RequireSuperAdmin title="Payment Methods">{children}</RequireSuperAdmin>;
}
