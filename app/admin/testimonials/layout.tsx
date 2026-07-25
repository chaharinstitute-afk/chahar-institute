import { ReactNode } from "react";
import { RequireSuperAdmin } from "@/components/admin/require-super-admin";

export default function TestimonialsLayout({ children }: { children: ReactNode }) {
  return <RequireSuperAdmin title="Testimonials">{children}</RequireSuperAdmin>;
}
