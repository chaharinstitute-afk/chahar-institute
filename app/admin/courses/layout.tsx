import { ReactNode } from "react";
import { RequireSuperAdmin } from "@/components/admin/require-super-admin";

export default function CoursesLayout({ children }: { children: ReactNode }) {
  return <RequireSuperAdmin title="Course Names">{children}</RequireSuperAdmin>;
}
