import { ReactNode } from "react";

// No access gate here — Super Admin gets full manage access, Admin gets a
// read-only view of the same page (see app/admin/courses/page.tsx). The API
// routes still enforce manage_courses independently for any write action.
export default function CoursesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
