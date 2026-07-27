import { Prisma } from "@prisma/client";

/** Shared Prisma include used everywhere a PaymentSubmission is serialized for the UI. */
export const paymentSubmissionInclude = {
  admission: {
    select: {
      id: true,
      admissionNo: true,
      totalFee: true,
      receivedAmount: true,
      dueAmount: true,
      nextPaymentDueDate: true,
      lastPaymentDate: true,
      currentPaymentStatus: true,
      createdBy: true,
      student: { select: { fullName: true, studentCode: true } },
    },
  },
  paymentMethod: { select: { id: true, label: true, type: true } },
  submitter: { select: { id: true, fullName: true } },
  verifier: { select: { id: true, fullName: true } },
} satisfies Prisma.PaymentSubmissionInclude;

type SubmissionWithRelations = Prisma.PaymentSubmissionGetPayload<{
  include: typeof paymentSubmissionInclude;
}>;

function toAmount(value: Prisma.Decimal | null | undefined): string | null {
  return value ? value.toString() : null;
}

/** Flattens a PaymentSubmission (+ relations) into the JSON shape the admin UI consumes. */
export function serializeSubmission(s: SubmissionWithRelations) {
  return {
    id: s.id.toString(),
    admissionId: s.admissionId.toString(),
    admission: {
      id: s.admission.id.toString(),
      admissionNo: s.admission.admissionNo,
      totalFee: toAmount(s.admission.totalFee),
      receivedAmount: toAmount(s.admission.receivedAmount),
      dueAmount: toAmount(s.admission.dueAmount),
      nextPaymentDueDate: s.admission.nextPaymentDueDate,
      lastPaymentDate: s.admission.lastPaymentDate,
      currentPaymentStatus: s.admission.currentPaymentStatus,
      createdBy: s.admission.createdBy ? s.admission.createdBy.toString() : null,
      student: { fullName: s.admission.student.fullName, studentCode: s.admission.student.studentCode },
    },
    paymentMethod: s.paymentMethod
      ? { id: s.paymentMethod.id.toString(), label: s.paymentMethod.label, type: s.paymentMethod.type }
      : null,
    amountPaid: toAmount(s.amountPaid),
    utrNumber: s.utrNumber,
    screenshotPath: s.screenshotPath,
    status: s.status,
    submittedBy: { id: s.submitter.id.toString(), fullName: s.submitter.fullName },
    submittedAt: s.submittedAt,
    verifiedBy: s.verifier ? { id: s.verifier.id.toString(), fullName: s.verifier.fullName } : null,
    verifiedAt: s.verifiedAt,
    remarks: s.remarks,
    totalFeeAtDecision: toAmount(s.totalFeeAtDecision),
    receivedAmountAtDecision: toAmount(s.receivedAmountAtDecision),
    dueAmountAtDecision: toAmount(s.dueAmountAtDecision),
    nextDueDateSet: s.nextDueDateSet,
  };
}

/** Derives the BRD's admission-level status rule: due > 0 => partially_paid, due == 0 => paid. */
export function deriveAdmissionPaymentStatus(dueAmount: number): "partially_paid" | "paid" {
  return dueAmount > 0 ? "partially_paid" : "paid";
}
