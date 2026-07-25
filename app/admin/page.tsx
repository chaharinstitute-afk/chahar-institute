import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  GraduationCap,
  Plus,
  ChevronRight,
  Printer,
  FilePen,
  Inbox,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AdmissionCard } from "@/components/admin/admission-card";
import { Card, PageHeader, StatusBadge, TableEmpty, TableWrap, Td, Th, Tr } from "@/components/admin/ui";

const PENDING_STATUSES = ["submitted", "under_verification", "documents_pending"] as const;

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  const canViewAll = granted.has(PERMISSIONS.VIEW_ALL_ADMISSIONS);

  // An Admin only ever sees their own admissions; a Super Admin sees everything.
  const scope = canViewAll ? {} : { createdBy: BigInt(session.user.id) };

  const [total, drafts, pending, approved, activeCourses, recent] = await Promise.all([
    prisma.admission.count({ where: scope }),
    prisma.admission.count({ where: { ...scope, admissionStatus: "draft" } }),
    prisma.admission.count({ where: { ...scope, admissionStatus: { in: [...PENDING_STATUSES] } } }),
    prisma.admission.count({ where: { ...scope, admissionStatus: "approved" } }),
    canViewAll ? prisma.course.count({ where: { status: "active" } }) : Promise.resolve(0),
    prisma.admission.findMany({
      where: scope,
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { fullName: true, studentCode: true } },
        course: { select: { courseName: true } },
        admissionSession: { select: { session: true, sessionType: true } },
        creator: { select: { fullName: true } },
      },
    }),
  ]);

  const stats = [
    {
      label: canViewAll ? "Total Admissions" : "My Admissions",
      value: total,
      icon: FileText,
      tint: "bg-[#013220]",
    },
    { label: "Drafts", value: drafts, icon: FilePen, tint: "bg-[#374151]" },
    {
      label: canViewAll ? "Awaiting Review" : "Submitted / In Review",
      value: pending,
      icon: Clock,
      tint: "bg-[#C5A059]",
    },
    { label: "Approved", value: approved, icon: CheckCircle2, tint: "bg-green-700" },
    ...(canViewAll
      ? [{ label: "Active Courses", value: activeCourses, icon: GraduationCap, tint: "bg-[#6B7280]" }]
      : []),
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={
          canViewAll
            ? "Overview of admission activity across all users"
            : "Your admission activity"
        }
        actions={
          <Link
            href="/admin/admissions/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#013220]"
          >
            <Plus className="size-4" />
            New Admission
          </Link>
        }
      />

      <div
        className={`mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 ${
          canViewAll ? "xl:grid-cols-5" : "xl:grid-cols-4"
        }`}
      >
        {stats.map(({ label, value, icon: Icon, tint }) => (
          <Card key={label} padded={false} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-2xl font-bold tracking-tight text-[#1A1A1A]">{value}</div>
                <div className="mt-1 text-sm text-[#6B7280]">{label}</div>
              </div>
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${tint}`}>
                <Icon className="size-4 text-white" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Admin-facing reminder of what they can do here. */}
      {!canViewAll && (
        <Card className="mb-8 p-4">
          <p className="text-sm text-[#6B7280]">
            You can create admissions, upload documents, submit them for review, and print or
            download the application. Once submitted, a Super Admin verifies and approves it.
          </p>
        </Card>
      )}

      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#1A1A1A]">
          <span className="h-[2px] w-5 rounded-full bg-[#C5A059]" />
          Recent Admissions
        </h2>
        <Link
          href="/admin/admissions"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#C5A059] hover:underline"
        >
          View all
          <ChevronRight className="size-3.5" />
        </Link>
      </div>

      {/* Below md: cards instead of a cramped table. */}
      <div className="flex flex-col gap-3 md:hidden">
        {recent.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E1D8] bg-white p-8 text-center text-[#9CA3AF]">
            <Inbox className="size-6" />
            <span className="text-sm">No admissions yet. Create the first one to get started.</span>
          </div>
        )}
        {recent.map((a) => (
          <AdmissionCard
            key={a.id.toString()}
            id={a.id.toString()}
            admissionNo={a.admissionNo}
            admissionStatus={a.admissionStatus}
            studentName={a.student.fullName}
            studentCode={a.student.studentCode}
            courseName={a.course.courseName}
            sessionLabel={`${a.admissionSession.session} · ${a.admissionSession.sessionType}`}
            filledBy={canViewAll ? a.creator?.fullName : undefined}
            date={a.createdAt.toLocaleDateString("en-IN")}
          />
        ))}
      </div>

      {/* md and up: full table. */}
      <div className="hidden md:block">
        <TableWrap>
          <thead>
            <tr>
              <Th>Admission No</Th>
              <Th>Student</Th>
              <Th>Course</Th>
              <Th>Session</Th>
              {canViewAll && <Th>Filled By</Th>}
              <Th>Status</Th>
              <Th>Date</Th>
              <Th className="w-20 text-right">Form</Th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 && (
              <TableEmpty colSpan={canViewAll ? 8 : 7} icon={<Inbox className="size-6" />}>
                No admissions yet. Create the first one to get started.
              </TableEmpty>
            )}
            {recent.map((a) => (
              <Tr key={a.id.toString()}>
                <Td className="whitespace-nowrap font-medium text-[#1A1A1A]">
                  <Link href={`/admin/admissions/${a.id}`} className="hover:text-[#C5A059] hover:underline">
                    {a.admissionNo}
                  </Link>
                </Td>
                <Td>
                  <span className="text-[#1A1A1A]">{a.student.fullName}</span>
                  <div className="text-xs text-[#9CA3AF]">{a.student.studentCode}</div>
                </Td>
                <Td className="text-[#6B7280]">{a.course.courseName}</Td>
                <Td className="whitespace-nowrap text-[#6B7280]">
                  {a.admissionSession.session} · {a.admissionSession.sessionType}
                </Td>
                {canViewAll && (
                  <Td className="text-[#6B7280]">{a.creator?.fullName ?? "—"}</Td>
                )}
                <Td>
                  <StatusBadge status={a.admissionStatus} />
                </Td>
                <Td className="whitespace-nowrap text-[#6B7280]">
                  {a.createdAt.toLocaleDateString("en-IN")}
                </Td>
                <Td>
                  <div className="flex justify-end">
                    <Link
                      href={`/admin/admissions/${a.id}/print`}
                      title="Print form"
                      aria-label="Print form"
                      className="flex size-8 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#1A1A1A]"
                    >
                      <Printer className="size-4" />
                    </Link>
                  </div>
                </Td>
              </Tr>
            ))}
          </tbody>
        </TableWrap>
      </div>
    </div>
  );
}
