import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getPermissionsForRole, PERMISSIONS } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PrintActions } from "@/components/admin/print-actions";

const QUALIFICATION_LABEL: Record<string, string> = {
  tenth: "10th",
  twelfth: "12th",
  graduation: "Graduation",
  post_graduation: "Post Graduation",
};

function fmtDate(value: Date | null) {
  return value ? new Date(value).toLocaleDateString("en-IN") : "—";
}

/** Label/value pair in the printed form. */
function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex gap-2 border-b border-dotted border-neutral-300 py-1.5">
      <span className="w-40 shrink-0 text-[11px] uppercase tracking-wide text-neutral-500">
        {label}
      </span>
      <span className="text-[13px] font-medium text-neutral-900">
        {value === null || value === undefined || value === "" ? "—" : value}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 break-inside-avoid">
      <h2 className="mb-2 border-b-2 border-neutral-800 pb-1 text-[13px] font-bold uppercase tracking-wide text-neutral-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function AdmissionPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const { id } = await params;
  const granted = await getPermissionsForRole(BigInt(session.user.roleId));
  const canViewAll = granted.has(PERMISSIONS.VIEW_ALL_ADMISSIONS);

  const admission = await prisma.admission.findUnique({
    where: { id: BigInt(id) },
    include: {
      student: {
        include: {
          academicRecords: true,
          religion: { select: { name: true } },
          casteCategory: { select: { name: true } },
          country: { select: { name: true } },
          documents: { include: { documentType: { select: { name: true } } } },
        },
      },
      course: true,
      admissionCategory: true,
      admissionSession: true,
      faculty: true,
      stream: true,
      creator: { select: { fullName: true } },
    },
  });

  if (!admission) notFound();

  // Admins may only print their own admissions.
  if (!canViewAll && admission.createdBy?.toString() !== session.user.id) {
    notFound();
  }

  const s = admission.student;

  return (
    <div className="mx-auto max-w-3xl bg-white p-4 text-neutral-900 sm:p-8 print:p-0">
      <PrintActions backHref={`/admin/admissions/${admission.id}`} />

      {/* Letterhead */}
      <header className="flex flex-col gap-3 border-b-2 border-neutral-800 pb-3 sm:flex-row sm:items-start sm:justify-between print:flex-row">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Chahar Institute</h1>
          <p className="text-[11px] text-neutral-600">
            Admission Application Form · Online &amp; Distance Education
          </p>
        </div>
        <div className="sm:text-right print:text-right">
          <div className="text-[11px] uppercase tracking-wide text-neutral-500">Admission No</div>
          <div className="text-base font-bold">{admission.admissionNo}</div>
          <div className="mt-0.5 text-[11px] capitalize text-neutral-600">
            {admission.admissionStatus.replace(/_/g, " ")}
          </div>
        </div>
      </header>

      <Section title="Applying For">
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 print:grid-cols-2">
          <Row label="Admission Category" value={admission.admissionCategory.categoryName} />
          <Row
            label="Admission Session"
            value={`${admission.admissionSession.session} - ${admission.admissionSession.sessionType}`}
          />
          <Row label="Admission Type" value={admission.admissionType} />
          <Row label="Faculty" value={admission.faculty?.name} />
          <Row label="Course" value={admission.course.courseName} />
          <Row label="Stream" value={admission.stream?.name} />
          <Row label="Semester" value={admission.semester} />
          <Row
            label="Registration Fee"
            value={admission.registrationFee ? `₹${admission.registrationFee.toString()}` : null}
          />
        </div>
      </Section>

      <Section title="Basic Details">
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 print:grid-cols-2">
          <Row label="Student Code" value={s.studentCode} />
          <Row label="Full Name" value={s.fullName} />
          <Row label="Father Name" value={s.fatherName} />
          <Row label="Mother Name" value={s.motherName} />
          <Row label="Date of Birth" value={fmtDate(s.dob)} />
          <Row label="Gender" value={s.gender} />
          <Row label="Category" value={s.casteCategory?.name} />
          <Row label="Religion" value={s.religion?.name} />
          <Row label="Marital Status" value={s.maritalStatus} />
          <Row label="Employment Status" value={s.employmentStatus} />
          <Row label="Aadhaar" value={s.aadhaar} />
          <Row label="ABC ID" value={s.abcId} />
          <Row label="DEB ID" value={s.debId} />
          <Row label="Country" value={s.country?.name} />
        </div>
      </Section>

      <Section title="Contact & Address">
        <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2 print:grid-cols-2">
          <Row label="Mobile" value={s.mobile} />
          <Row label="Alternate Mobile" value={s.alternateMobile} />
          <Row label="Email" value={s.email} />
          <Row label="Alternate Email" value={s.alternateEmail} />
          <Row label="Address" value={s.address} />
          <Row label="City" value={s.city} />
          <Row label="District" value={s.district} />
          <Row label="State" value={s.state} />
          <Row label="Pincode" value={s.pincode} />
        </div>
      </Section>

      {s.academicRecords.length > 0 && (
        <Section title="Academics">
          <table className="w-full border-collapse text-[12px]">
            <thead>
              <tr className="bg-neutral-100">
                <th className="border border-neutral-300 px-2 py-1.5 text-left font-semibold">
                  Examination
                </th>
                <th className="border border-neutral-300 px-2 py-1.5 text-left font-semibold">
                  Board / University
                </th>
                <th className="border border-neutral-300 px-2 py-1.5 text-left font-semibold">
                  Year
                </th>
                <th className="border border-neutral-300 px-2 py-1.5 text-left font-semibold">
                  % Marks
                </th>
                <th className="border border-neutral-300 px-2 py-1.5 text-left font-semibold">
                  Result
                </th>
              </tr>
            </thead>
            <tbody>
              {s.academicRecords.map((r) => (
                <tr key={r.id.toString()}>
                  <td className="border border-neutral-300 px-2 py-1.5 font-medium">
                    {QUALIFICATION_LABEL[r.qualification] ?? r.qualification}
                  </td>
                  <td className="border border-neutral-300 px-2 py-1.5">
                    {r.boardUniversity ?? "—"}
                  </td>
                  <td className="border border-neutral-300 px-2 py-1.5">{r.passingYear ?? "—"}</td>
                  <td className="border border-neutral-300 px-2 py-1.5">
                    {r.percentage ? `${r.percentage.toString()}%` : "—"}
                  </td>
                  <td className="border border-neutral-300 px-2 py-1.5">{r.result ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}

      <Section title="Documents Submitted">
        {s.documents.length === 0 ? (
          <p className="text-[12px] text-neutral-600">No documents uploaded.</p>
        ) : (
          <ol className="grid grid-cols-1 gap-x-8 text-[12px] sm:grid-cols-2 print:grid-cols-2">
            {s.documents.map((d, i) => (
              <li key={d.id.toString()} className="border-b border-dotted border-neutral-300 py-1.5">
                {i + 1}. {d.documentType.name}
              </li>
            ))}
          </ol>
        )}
      </Section>

      {/* Declaration + signatures */}
      <Section title="Declaration">
        <p className="text-[11px] leading-relaxed text-neutral-700">
          I hereby declare that the information provided above is true and correct to the best of my
          knowledge. I understand that any false information may result in cancellation of my
          admission at any stage.
        </p>
        <div className="mt-10 flex flex-col gap-6 text-[11px] text-neutral-700 sm:flex-row sm:justify-between sm:gap-0 print:flex-row print:justify-between">
          <div className="w-full border-t border-neutral-500 pt-1 text-center sm:w-52 print:w-52">
            Student&apos;s Signature
          </div>
          <div className="w-full border-t border-neutral-500 pt-1 text-center sm:w-52 print:w-52">
            Authorised Signatory
          </div>
        </div>
      </Section>

      <footer className="mt-6 border-t border-neutral-300 pt-2 text-[10px] text-neutral-500">
        Created by {admission.creator?.fullName ?? "—"} on {fmtDate(admission.createdAt)} · Printed on{" "}
        {new Date().toLocaleDateString("en-IN")}
      </footer>
    </div>
  );
}
