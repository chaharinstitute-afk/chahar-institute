# Manual Payment Management — Technical Design

Status: Draft for review
Related: `admin/ADMIN_PANEL_PLAN.md`, `prisma/schema.prisma`

## 1. Overview

Admins submit proof of payment (screenshot + optional UTR) against an admission.
Super Admins verify (approve/reject) the proof and, on approval, update the
admission's running fee balance (Total Fee / Received / Due / Next Due Date).
This mirrors the existing Admission verification pattern (`ReviewPanel` +
`status` route) and the existing document upload/serving pattern
(`lib/uploads.ts` + `app/api/admin/documents/[docId]/route.ts`).

Two things are tracked separately, both called "Payment Status" in the BRD:

- **Submission status** — the state of one payment proof: `pending_verification`,
  `approved`, `rejected`.
- **Admission balance status** — the admission's overall standing, derived after
  approval from `dueAmount`: `pending_verification` (no approved payment yet),
  `partially_paid` (due > 0), `paid` (due = 0), `rejected` (latest submission
  was rejected and nothing pending behind it).

These collapse into a single field per admission (`currentPaymentStatus`) that
the Due Payments and Payment History pages read directly, avoiding
recomputation on every list render.

## 2. Data Model

### 2.1 New enums

```prisma
enum PaymentMethodType {
  upi
  bank_transfer
}

enum PaymentSubmissionStatus {
  pending_verification
  approved
  rejected
}

enum AdmissionPaymentStatus {
  pending_verification
  partially_paid
  paid
  rejected
}
```

`PaymentMethodType` is added now even though the BRD only asks for QR/UPI, so a
future "Bank Transfer" method doesn't require a schema migration — flagging
this as a minor scope addition, easy to drop if you'd rather keep it UPI-only.

### 2.2 New model: `PaymentMethod` (Super Admin managed)

```prisma
model PaymentMethod {
  id             BigInt            @id @default(autoincrement())
  type           PaymentMethodType @default(upi)
  label          String            @db.VarChar(100) // e.g. "Primary UPI", "HDFC Current A/C"
  upiId          String?           @map("upi_id") @db.VarChar(100)
  upiNumber      String?           @map("upi_number") @db.VarChar(20)
  qrCodeImage    String?           @map("qr_code_image") @db.VarChar(255) // path under uploads/
  bankName       String?           @map("bank_name") @db.VarChar(150)
  accountNumber  String?           @map("account_number") @db.VarChar(50)
  ifscCode       String?           @map("ifsc_code") @db.VarChar(20)
  isActive       Boolean           @default(true) @map("is_active")
  sortOrder      Int               @default(0) @map("sort_order")
  createdAt      DateTime          @default(now()) @map("created_at")
  updatedAt      DateTime          @updatedAt @map("updated_at")

  submissions PaymentSubmission[]

  @@map("payment_methods")
}
```

Only active methods are shown in the Admin's "Pay" popup. QR code image is
stored the same way as student documents — outside `/public`, served through
an authenticated route — since this page is only reachable by logged-in admin
users, not the public site.

### 2.3 New model: `PaymentSubmission` (the Payment History row)

This replaces the existing `Payment` model for this feature. The existing
`Payment`/`PaymentStatus`/`Admission.paymentStatus`/`Admission.registrationFee`
fields stay untouched — they back the original "registration fee at admission
creation" concept and aren't part of this BRD. Flagging this clearly: **we are
not reusing or renaming the existing `Payment` table**, because it doesn't
carry a screenshot, UTR, verifier, or the 4-state status the BRD needs, and
repurposing it risks breaking whatever currently reads `registrationFee`/the
old `paymentStatus` field.

```prisma
model PaymentSubmission {
  id              BigInt                    @id @default(autoincrement())
  admissionId     BigInt                    @map("admission_id")
  paymentMethodId BigInt?                   @map("payment_method_id")

  // Filled by Admin at submission time
  amountPaid      Decimal                   @map("amount_paid") @db.Decimal(10, 2)
  utrNumber       String?                   @map("utr_number") @db.VarChar(100)
  screenshotPath  String                    @map("screenshot_path") @db.VarChar(255)
  submittedBy     BigInt                    @map("submitted_by")
  submittedAt     DateTime                  @default(now()) @map("submitted_at")

  // Filled by Super Admin at verification time
  status          PaymentSubmissionStatus   @default(pending_verification)
  verifiedBy      BigInt?                   @map("verified_by")
  verifiedAt      DateTime?                 @map("verified_at")
  remarks         String?                   @db.Text

  // Snapshot of the admission's running balance at the moment this submission
  // was decided — the audit trail for the Payment History table. (Admission's
  // live totals below can change again later; these three stay fixed to what
  // was true right after this decision.)
  totalFeeAtDecision     Decimal? @map("total_fee_at_decision") @db.Decimal(10, 2)
  receivedAmountAtDecision Decimal? @map("received_amount_at_decision") @db.Decimal(10, 2)
  dueAmountAtDecision    Decimal? @map("due_amount_at_decision") @db.Decimal(10, 2)
  nextDueDateSet         DateTime? @map("next_due_date_set") @db.Date

  admission     Admission      @relation(fields: [admissionId], references: [id], onDelete: Cascade)
  paymentMethod PaymentMethod? @relation(fields: [paymentMethodId], references: [id])
  submitter     User           @relation("PaymentSubmittedBy", fields: [submittedBy], references: [id])
  verifier      User?          @relation("PaymentVerifiedBy", fields: [verifiedBy], references: [id])

  @@map("payment_submissions")
}
```

`amountPaid` is a field the BRD's Payment History column list doesn't name
explicitly, but the payment popup has to record how much the admin is paying
this time — without it there's nothing to base "Received Amount" on when the
Super Admin approves. Flagging this as a sensible addition; the Super Admin
still has final say and can approve with a different Received Amount than
`amountPaid` if needed.

### 2.4 `Admission` — new fields (live balance, for fast Due Payments listing)

```prisma
model Admission {
  // ...existing fields...
  totalFee              Decimal?                @map("total_fee") @db.Decimal(10, 2)
  receivedAmount        Decimal?                @map("received_amount") @db.Decimal(10, 2)
  dueAmount             Decimal?                @map("due_amount") @db.Decimal(10, 2)
  nextPaymentDueDate    DateTime?               @map("next_payment_due_date") @db.Date
  lastPaymentDate       DateTime?               @map("last_payment_date")
  currentPaymentStatus  AdmissionPaymentStatus? @map("current_payment_status")

  paymentSubmissions PaymentSubmission[]
  // ...existing relations...
}
```

All nullable, all new — this is a plain additive migration (`prisma migrate
dev`), no manual SQL needed (unlike the earlier `yearlyFee` rename, nothing
here drops or renames an existing column).

`totalFee` is separate from `Course.universityFee` + `Course.totalAdminFee` —
it's editable per-admission since a Super Admin may negotiate a different
total for a specific student. It can default from the course's fees when the
first payment method popup opens, but isn't required to.

### 2.5 `User` — two new named relations (for the FKs above)

```prisma
model User {
  // ...existing fields/relations...
  submittedPayments PaymentSubmission[] @relation("PaymentSubmittedBy")
  verifiedPayments  PaymentSubmission[] @relation("PaymentVerifiedBy")
}
```

## 3. Permissions (`lib/rbac.ts`)

| Key | Super Admin | Admin | Used for |
|---|---|---|---|
| `manage_payment_methods` | ✅ | ❌ | CRUD on QR/UPI methods |
| `submit_payment` | ✅ | ✅ | Clicking "Pay", uploading proof |
| `verify_payment` | ✅ | ❌ | Approve/reject + set balances |

Viewing scope (Payment History, Due Payments) reuses the existing
`VIEW_ALL_ADMISSIONS` check already used for admissions — Admin sees only
payments tied to admissions they created, Super Admin sees all. No new
permission needed for read access.

`prisma/seed.ts`: grant `manage_payment_methods` + `verify_payment` to Super
Admin's role only; grant `submit_payment` to both roles — same pattern as
`submit_admission` today.

## 4. File storage

Extend `lib/uploads.ts` rather than duplicating it. Current
`saveUploadedFile(file, studentId)` hardcodes the `students/{id}` folder;
generalize with an explicit subfolder param:

```ts
export async function saveUploadedFile(file: File, subfolder: string): Promise<string>
```

Callers change to `saveUploadedFile(file, \`students/${studentId}\`)` (no
behavior change for existing callers) and new callers use
`saveUploadedFile(file, \`payments/${admissionId}\`)` for screenshots and
`saveUploadedFile(file, "payment-methods")` for QR codes. Same validation
(image types + 5MB limit) applies — good fit, screenshots are images.

New authenticated file-serving route, mirroring
`app/api/admin/documents/[docId]/route.ts`:

- `GET /api/admin/payments/[submissionId]/screenshot` — checks
  `VIEW_ALL_ADMISSIONS` or ownership of the underlying admission before
  streaming the file.
- QR code images: served via
  `GET /api/admin/payment-methods/[id]/qr-code` — any authenticated admin user
  (Admin needs to see it in the Pay popup), no extra permission check beyond
  being logged in.

## 5. API routes

| Route | Method | Who | Purpose |
|---|---|---|---|
| `/api/admin/payment-methods` | GET | any authenticated admin | List active methods (for Pay popup) / all methods (Super Admin management page passes `?all=1`) |
| `/api/admin/payment-methods` | POST | `manage_payment_methods` | Create method (multipart: fields + QR image) |
| `/api/admin/payment-methods/[id]` | PATCH | `manage_payment_methods` | Update fields / replace QR image / toggle active |
| `/api/admin/payment-methods/[id]` | DELETE | `manage_payment_methods` | Delete method |
| `/api/admin/payment-methods/[id]/qr-code` | GET | any authenticated admin | Stream QR image |
| `/api/admin/admissions/[id]/payments` | GET | scoped by `VIEW_ALL_ADMISSIONS` | Submission history for one admission |
| `/api/admin/admissions/[id]/payments` | POST | `submit_payment` + ownership check (same pattern as the status route) | Create a submission (multipart: amountPaid, paymentMethodId, utrNumber?, screenshot file) → status `pending_verification` |
| `/api/admin/payments` | GET | scoped | Global Payment History list, filters: student name, admission no, status, date range |
| `/api/admin/payments/due` | GET | scoped | Due Payments list — admissions where `dueAmount > 0`, filters: due date, student name, admission no, status, (Super Admin only: filter by submitting Admin) |
| `/api/admin/payments/[submissionId]/verify` | PATCH | `verify_payment` | Body: `{ decision: "approved"\|"rejected", totalFee?, receivedAmount?, dueAmount?, nextPaymentDueDate?, remarks? }`. On approve: writes the submission's decision fields + snapshot columns, updates `Admission.totalFee/receivedAmount/dueAmount/lastPaymentDate/nextPaymentDueDate/currentPaymentStatus` in a `$transaction`, and writes an `AdmissionLog` row (reusing the existing audit table, action `payment_approved`/`payment_rejected`) |

`dueAmount` on approval: if the Super Admin submits `totalFee`/`receivedAmount`
without an explicit `dueAmount`, the API computes `dueAmount = totalFee -
receivedAmount` server-side rather than trusting a client-sent due amount that
might not match, then applies the BRD's rule (`due > 0` → `partially_paid`,
`due == 0` → `paid`) to set `currentPaymentStatus`.

## 6. UI

- **Admissions list/detail**: add a "Pay" button (icon + label, near existing
  status actions). Opens a modal (`PaymentPopup`) showing the active payment
  methods (QR image, UPI ID, UPI Number) and the admission's current due
  amount, with a form: amount paid (required, prefilled with due amount),
  payment method select, UTR (optional), screenshot upload (required, reuses
  the existing document-upload input styling). Submits to the admission's
  `/payments` POST route.
- **`/admin/payments`** (Payment History) — table with the BRD's exact
  columns, visible to both roles (scoped). Filters: student name, admission
  no, status, date range.
- **`/admin/payments/due`** (Due Payments) — table with the BRD's exact
  columns + a "Pay" / "Follow up" action. Filters: due date, student name,
  admission no, status (+ submitting Admin, Super Admin only).
- **Verification panel**: a `PaymentReviewPanel` component mirroring
  `ReviewPanel` — shown on a submission's detail (or inline in an expandable
  row in Payment History) with Approve/Reject buttons for Super Admin. On
  choosing Approve, a small form appears for Total Fee / Received Amount / Due
  Amount (auto-computed, editable) / Next Due Date (optional) / Remarks
  (optional), matching the BRD's approval-time fields exactly.
- **`/admin/payment-methods`** (Super Admin only, added to the existing
  `MANAGE_LINKS` sidebar group next to Course Names/Masters) — CRUD list +
  form with QR image upload, UPI ID/Number, active toggle.
- Sidebar nav (`components/admin/sidebar-nav.tsx`): new "Payments" group with
  Due Payments + Payment History in `BASE_LINKS` (both roles), Payment Methods
  in `MANAGE_LINKS` (Super Admin only) — same split already used for Course
  Names vs Masters.

## 7. Migration plan

1. Add the two new enums + `PaymentMethod` + `PaymentSubmission` models, plus
   the six new nullable columns on `Admission`, plus the two named relations
   on `User`. All additive — safe for `prisma migrate dev --name
   add_manual_payment_management` (no hand-written SQL required, unlike the
   earlier fee rename).
2. Update `prisma/seed.ts`: add the three new permission rows, grant to roles
   per §3.
3. `lib/uploads.ts`: generalize `saveUploadedFile`'s second parameter as
   described in §4 (small, backwards-compatible signature change — verify all
   existing call sites are updated).

## 8. Open points to confirm before I start building

1. OK with the two new enums/status split (submission-level vs
   admission-level), rather than one shared status field? It keeps the
   states honest but is slightly more moving parts than the BRD's single
   "Payment Status" list implies.
2. OK with adding `amountPaid` to the submission (not explicitly in the BRD's
   field list) so the popup has something to record per transaction?
3. Should `PaymentMethodType` include `bank_transfer` now, or keep it
   UPI/QR-only per the literal BRD and add bank transfer later if needed?
4. Payment History / Due Payments pages — should Admin see all admissions'
   payments or only ones they created? I assumed the same scoping already
   used for Admissions (`VIEW_ALL_ADMISSIONS`), consistent with how Leads/
   Courses visibility was split earlier.
