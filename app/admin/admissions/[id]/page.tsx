"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileCheck2,
  Printer,
  Send,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { ReviewPanel } from "@/components/admin/review-panel";
import { PaymentPopup } from "@/components/admin/payment-popup";
import { PaymentReviewPanel } from "@/components/admin/payment-review-panel";
import {
  Badge,
  BadgeTone,
  Card,
  FormSection,
  StatusBadge,
  TableEmpty,
  TableWrap,
  Td,
  Th,
  Tr,
} from "@/components/admin/ui";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type AcademicRecord = {
  id: string;
  qualification: "tenth" | "twelfth" | "graduation" | "post_graduation";
  boardUniversity: string | null;
  passingYear: number | null;
  percentage: string | null;
  result: string | null;
};

type DocumentRow = {
  id: string;
  documentTypeId: string;
  documentTypeName: string;
  filePath: string;
  verified: boolean;
  uploadedAt: string;
};

type AdmissionDetail = {
  id: string;
  admissionNo: string;
  admissionStatus: string;
  canReview: boolean;
  remarks: string | null;
  createdBy: { fullName: string; email: string } | null;
  createdAt: string;
  student: { id: string; fullName: string; studentCode: string; mobile: string | null };
  course: { courseName: string };
  admissionCategory: { categoryName: string };
  admissionSession: { session: string; sessionType: string };
  academicRecords: AcademicRecord[];
  documents: DocumentRow[];
  totalFee: string | null;
  receivedAmount: string | null;
  dueAmount: string | null;
  nextPaymentDueDate: string | null;
  currentPaymentStatus: "pending_verification" | "partially_paid" | "paid" | "rejected" | null;
};

type PaymentSubmissionRow = {
  id: string;
  amountPaid: string | null;
  utrNumber: string | null;
  screenshotPath: string;
  status: "pending_verification" | "approved" | "rejected";
  submittedBy: { fullName: string };
  submittedAt: string;
  verifiedBy: { fullName: string } | null;
  verifiedAt: string | null;
  remarks: string | null;
  admission: {
    totalFee: string | null;
    receivedAmount: string | null;
    dueAmount: string | null;
  };
};

const PAYMENT_STATUS_TONE: Record<string, BadgeTone> = {
  pending_verification: "warn",
  partially_paid: "info",
  paid: "success",
  rejected: "danger",
};

type DocumentType = { id: string; name: string };

const QUALIFICATION_LABEL: Record<string, string> = {
  tenth: "10th",
  twelfth: "12th",
  graduation: "Graduation",
  post_graduation: "Post Graduation",
};

export default function AdmissionDetailPage() {
  const params = useParams();
  const admissionId = params.id as string;

  const [admission, setAdmission] = useState<AdmissionDetail | null>(null);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [payments, setPayments] = useState<PaymentSubmissionRow[]>([]);
  const [payPopupOpen, setPayPopupOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingTypeId, setUploadingTypeId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<DocumentRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [admissionRes, typesRes, paymentsRes] = await Promise.all([
      apiFetch(`/api/admin/admissions/${admissionId}`),
      apiFetch("/api/admin/masters/document-types"),
      apiFetch(`/api/admin/admissions/${admissionId}/payments`),
    ]);
    if (admissionRes?.ok) setAdmission(await admissionRes.json());
    if (typesRes?.ok) setDocumentTypes(await typesRes.json());
    if (paymentsRes?.ok) setPayments(await paymentsRes.json());
    setLoading(false);
  }, [admissionId]);

  useEffect(() => {
    load();
  }, [load]);

  function handleFileChange(typeId: string, file: File | null) {
    setSelectedFiles((prev) => ({ ...prev, [typeId]: file }));
  }

  async function handleUpload(typeId: string) {
    const file = selectedFiles[typeId];
    if (!file) return;

    setError(null);
    setUploadingTypeId(typeId);

    const formData = new FormData();
    formData.append("documentTypeId", typeId);
    formData.append("file", file);

    const res = await apiFetch(`/api/admin/admissions/${admissionId}/documents`, {
      method: "POST",
      body: formData,
    });

    setUploadingTypeId(null);
    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Upload failed");
      return;
    }

    setSelectedFiles((prev) => ({ ...prev, [typeId]: null }));
    load();
  }

  async function handleSubmitAdmission() {
    setSubmitting(true);
    setSubmitError(null);

    const res = await apiFetch(`/api/admin/admissions/${admissionId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "submitted" }),
    });

    setSubmitting(false);
    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setSubmitError(body.error || "Could not submit the admission");
      return;
    }

    setSubmitOpen(false);
    setNotice("Admission submitted for verification.");
    load();
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    setDeleteError(null);

    const res = await apiFetch(`/api/admin/documents/${pendingDelete.id}`, { method: "DELETE" });

    setDeleting(false);
    if (!res) return;

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setDeleteError(body.error || "Delete failed");
      return;
    }

    setPendingDelete(null);
    load();
  }

  if (loading) {
    return <p className="text-sm text-[#9CA3AF]">Loading…</p>;
  }

  if (!admission) {
    return (
      <Card className="flex items-center gap-2">
        <AlertCircle className="size-4 shrink-0 text-red-600" />
        <p className="text-sm text-red-700">
          Admission not found, or you don&apos;t have access to it.
        </p>
      </Card>
    );
  }

  const uploadedByType = new Map(admission.documents.map((d) => [d.documentTypeId, d]));
  const uploadedCount = admission.documents.length;

  return (
    <div className="w-full">
      {/* Breadcrumb + header */}
      <nav className="mb-4 flex items-center gap-1 text-xs text-[#9CA3AF]">
        <Link href="/admin/admissions" className="hover:text-[#1A1A1A] hover:underline">
          Admissions
        </Link>
        <ChevronRight className="size-3" />
        <span className="text-[#6B7280]">{admission.admissionNo}</span>
      </nav>

      <Card className="mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">
                {admission.admissionNo}
              </h1>
              <StatusBadge status={admission.admissionStatus} />
              {admission.currentPaymentStatus && (
                <Badge tone={PAYMENT_STATUS_TONE[admission.currentPaymentStatus]}>
                  {admission.currentPaymentStatus.replace(/_/g, " ")}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-sm text-[#6B7280]">
              {admission.student.fullName}{" "}
              <span className="text-[#9CA3AF]">({admission.student.studentCode})</span>
              {admission.student.mobile && ` · ${admission.student.mobile}`}
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <Link
              href={`/admin/admissions/${admission.id}/print`}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-3.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6] sm:flex-none"
            >
              <Printer className="size-4" />
              Print Form
            </Link>

            <button
              type="button"
              onClick={() => setPayPopupOpen(true)}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#E5E1D8] bg-white px-3.5 text-sm font-medium text-[#374151] transition-colors hover:bg-[#F3F4F6] sm:flex-none"
            >
              <Wallet className="size-4" />
              Pay
            </button>

            {admission.admissionStatus === "draft" && (
              <button
                type="button"
                onClick={() => {
                  setSubmitError(null);
                  setSubmitOpen(true);
                }}
                className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1A1A1A] px-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#013220] sm:flex-none"
              >
                <Send className="size-4" />
                Submit Admission
              </button>
            )}
          </div>
        </div>

        {notice && (
          <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            <CheckCircle2 className="size-4 shrink-0" />
            {notice}
          </p>
        )}

        <div className="mt-4 border-t border-[#F0EDE7] pt-4">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
            <div>
              <dt className="text-[0.68rem] uppercase tracking-[0.08em] text-[#9CA3AF]">Course</dt>
              <dd className="text-sm font-medium text-[#1A1A1A]">{admission.course.courseName}</dd>
            </div>
            <div>
              <dt className="text-[0.68rem] uppercase tracking-[0.08em] text-[#9CA3AF]">Category</dt>
              <dd className="text-sm font-medium text-[#1A1A1A]">
                {admission.admissionCategory.categoryName}
              </dd>
            </div>
            <div>
              <dt className="text-[0.68rem] uppercase tracking-[0.08em] text-[#9CA3AF]">Session</dt>
              <dd className="text-sm font-medium text-[#1A1A1A]">
                {admission.admissionSession.session} · {admission.admissionSession.sessionType}
              </dd>
            </div>
            <div>
              <dt className="text-[0.68rem] uppercase tracking-[0.08em] text-[#9CA3AF]">
                Documents
              </dt>
              <dd className="text-sm font-medium text-[#1A1A1A]">
                {uploadedCount} of {documentTypes.length} uploaded
              </dd>
            </div>
            <div>
              <dt className="text-[0.68rem] uppercase tracking-[0.08em] text-[#9CA3AF]">
                Filled By
              </dt>
              <dd className="text-sm font-medium text-[#1A1A1A]">
                {admission.createdBy?.fullName ?? "—"}
                <span className="block text-[0.68rem] font-normal text-[#9CA3AF]">
                  {new Date(admission.createdAt).toLocaleDateString("en-IN")}
                </span>
              </dd>
            </div>
            {(admission.totalFee || admission.receivedAmount || admission.dueAmount) && (
              <>
                <div>
                  <dt className="text-[0.68rem] uppercase tracking-[0.08em] text-[#9CA3AF]">
                    Total Fee
                  </dt>
                  <dd className="text-sm font-medium text-[#1A1A1A]">
                    {admission.totalFee ? `₹${admission.totalFee}` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.68rem] uppercase tracking-[0.08em] text-[#9CA3AF]">
                    Received
                  </dt>
                  <dd className="text-sm font-medium text-green-700">
                    {admission.receivedAmount ? `₹${admission.receivedAmount}` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.68rem] uppercase tracking-[0.08em] text-[#9CA3AF]">
                    Due
                  </dt>
                  <dd className="text-sm font-medium text-amber-700">
                    {admission.dueAmount ? `₹${admission.dueAmount}` : "₹0.00"}
                  </dd>
                </div>
                {admission.nextPaymentDueDate && (
                  <div>
                    <dt className="text-[0.68rem] uppercase tracking-[0.08em] text-[#9CA3AF]">
                      Next Due Date
                    </dt>
                    <dd className="text-sm font-medium text-[#1A1A1A]">
                      {new Date(admission.nextPaymentDueDate).toLocaleDateString("en-IN")}
                    </dd>
                  </div>
                )}
              </>
            )}
          </dl>

          {admission.remarks && (
            <div className="mt-4 rounded-lg bg-[#FDFBF7] px-3 py-2">
              <div className="text-[0.68rem] uppercase tracking-[0.08em] text-[#9CA3AF]">
                Remarks
              </div>
              <p className="mt-0.5 text-sm text-[#374151]">{admission.remarks}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Verification actions — Super Admin only */}
      {admission.canReview && (
        <ReviewPanel
          admissionId={admission.id}
          currentStatus={admission.admissionStatus}
          onChanged={() => {
            setNotice(null);
            load();
          }}
        />
      )}

      {/* Academics */}
      {admission.academicRecords.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#1A1A1A]">
            <span className="h-[2px] w-5 rounded-full bg-[#C5A059]" />
            Academics
          </h2>
          <TableWrap>
            <thead>
              <tr>
                <Th>Examination</Th>
                <Th>Board/University</Th>
                <Th>Year of Passing</Th>
                <Th>% Marks</Th>
                <Th>Result</Th>
              </tr>
            </thead>
            <tbody>
              {admission.academicRecords.map((r) => (
                <Tr key={r.id}>
                  <Td className="font-medium text-[#1A1A1A]">
                    {QUALIFICATION_LABEL[r.qualification]}
                  </Td>
                  <Td className="text-[#6B7280]">{r.boardUniversity || "—"}</Td>
                  <Td className="text-[#6B7280]">{r.passingYear || "—"}</Td>
                  <Td className="text-[#6B7280]">{r.percentage ? `${r.percentage}%` : "—"}</Td>
                  <Td className="text-[#6B7280]">{r.result || "—"}</Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      )}

      {/* Payments */}
      {payments.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#1A1A1A]">
            <span className="h-[2px] w-5 rounded-full bg-[#C5A059]" />
            Payments
          </h2>

          {admission.canReview &&
            payments
              .filter((p) => p.status === "pending_verification")
              .map((p) => (
                <PaymentReviewPanel
                  key={p.id}
                  submission={p}
                  onChanged={() => {
                    setNotice(null);
                    load();
                  }}
                />
              ))}

          <TableWrap>
            <thead>
              <tr>
                <Th>Submitted</Th>
                <Th>Amount Paid</Th>
                <Th>UTR</Th>
                <Th>Status</Th>
                <Th>Verified By</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <Tr key={p.id}>
                  <Td className="whitespace-nowrap text-[#6B7280]">
                    {new Date(p.submittedAt).toLocaleDateString("en-IN")}
                    <div className="text-xs text-[#9CA3AF]">{p.submittedBy.fullName}</div>
                  </Td>
                  <Td className="font-medium text-[#1A1A1A]">
                    {p.amountPaid ? `₹${p.amountPaid}` : "—"}
                  </Td>
                  <Td className="text-[#6B7280]">{p.utrNumber || "—"}</Td>
                  <Td>
                    <Badge tone={PAYMENT_STATUS_TONE[p.status] ?? "neutral"}>
                      {p.status.replace(/_/g, " ")}
                    </Badge>
                  </Td>
                  <Td className="text-[#6B7280]">{p.verifiedBy?.fullName || "—"}</Td>
                  <Td>
                    <a
                      href={`/api/admin/payments/${p.id}/screenshot`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-[#8a6d31] hover:underline"
                    >
                      <Eye className="size-3.5" />
                      View
                    </a>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>
        </div>
      )}

      {/* Documents */}
      <Card>
        <FormSection
          title="Upload Documents"
          actions={
            <span className="text-xs font-medium text-[#6B7280]">
              {uploadedCount} of {documentTypes.length} uploaded
            </span>
          }
        >
          <p className="-mt-1 mb-4 text-xs text-[#9CA3AF]">
            JPG, PNG, WEBP or PDF only · max 5MB per file
          </p>

          {error && (
            <p className="mb-4 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle className="size-4 shrink-0" />
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {documentTypes.map((type) => {
              const uploaded = uploadedByType.get(type.id);
              const isUploading = uploadingTypeId === type.id;
              const picked = selectedFiles[type.id];

              return (
                <div
                  key={type.id}
                  className={cn(
                    "rounded-xl border p-3.5 transition-colors",
                    uploaded ? "border-green-200 bg-green-50/40" : "border-[#E5E1D8] bg-white"
                  )}
                >
                  <div className="mb-2.5 flex items-start gap-2">
                    {uploaded ? (
                      <FileCheck2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                    ) : (
                      <Upload className="mt-0.5 size-4 shrink-0 text-[#9CA3AF]" />
                    )}
                    <span className="text-sm font-medium leading-snug text-[#1A1A1A]">
                      {type.name}
                    </span>
                  </div>

                  {uploaded ? (
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/api/admin/documents/${uploaded.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-green-200 bg-white text-xs font-medium text-green-700 transition-colors hover:bg-green-50"
                      >
                        <Eye className="size-3.5" />
                        View
                      </a>
                      <a
                        href={`/api/admin/documents/${uploaded.id}?download=1`}
                        title="Download"
                        aria-label="Download"
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-green-200 bg-white text-green-700 transition-colors hover:bg-green-50"
                      >
                        <Download className="size-4" />
                      </a>
                      <button
                        type="button"
                        title="Remove"
                        aria-label="Remove"
                        onClick={() => {
                          setDeleteError(null);
                          setPendingDelete(uploaded);
                        }}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-[#9CA3AF] transition-colors hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.pdf"
                        onChange={(e) => handleFileChange(type.id, e.target.files?.[0] || null)}
                        className="block w-full text-xs text-[#6B7280] file:mr-2 file:rounded-md file:border-0 file:bg-[#F3F4F6] file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-[#374151] hover:file:bg-[#E5E7EB]"
                      />
                      <button
                        type="button"
                        disabled={!picked || isUploading}
                        onClick={() => handleUpload(type.id)}
                        className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-[#1A1A1A] text-xs font-semibold text-white transition-colors hover:bg-[#013220] disabled:bg-[#E5E1D8] disabled:text-[#9CA3AF]"
                      >
                        <Upload className="size-3.5" />
                        {isUploading ? "Uploading…" : "Upload"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {documentTypes.length === 0 && (
              <p className="text-sm text-[#9CA3AF]">
                No document types configured. Add them under Masters → Document Types.
              </p>
            )}
          </div>
        </FormSection>
      </Card>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDelete(null);
            setDeleteError(null);
          }
        }}
        title={pendingDelete ? `Remove ${pendingDelete.documentTypeName}?` : "Remove document?"}
        description="The uploaded file record will be removed and you can upload a replacement."
        confirmLabel="Remove"
        onConfirm={handleConfirmDelete}
        loading={deleting}
        error={deleteError}
      />

      <PaymentPopup
        open={payPopupOpen}
        onOpenChange={setPayPopupOpen}
        admissionId={admission.id}
        dueAmount={admission.dueAmount}
        onSubmitted={() => {
          setNotice("Payment submitted for verification.");
          load();
        }}
      />

      <ConfirmDialog
        open={submitOpen}
        onOpenChange={(open) => {
          if (!open) {
            setSubmitOpen(false);
            setSubmitError(null);
          }
        }}
        tone="primary"
        title="Submit this admission for verification?"
        description={
          uploadedCount < documentTypes.length
            ? `Only ${uploadedCount} of ${documentTypes.length} documents are uploaded. You can still submit now and upload the rest later.`
            : "All documents are uploaded. The admission moves to verification and can no longer be edited as a draft."
        }
        confirmLabel="Submit Admission"
        onConfirm={handleSubmitAdmission}
        loading={submitting}
        error={submitError}
      />
    </div>
  );
}
