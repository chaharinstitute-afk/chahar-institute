# Chahar Institute – Admin Panel Plan

Module: Admission Management System
Database: MySQL 8

## 1. Recommended Stack

Kept intentionally simple — one app, one database, one hosting plan.

- **Same Next.js app** – admin panel lives under a route group (`app/(admin)/admin/...`) rather than a separate app. Route Handlers act as the API layer. No separate backend service.
- **Prisma ORM + MySQL 8** (via `mysql2` driver) – type-safe queries, easy migrations.
- **Auth.js (NextAuth v5)** with Credentials provider + JWT session, bcrypt for password hashing – role/permission checked in middleware and per route.
- **zod + react-hook-form** – already in the project's dependencies, reused for admin forms.
- **File uploads** – stored on local disk on the same server, outside `/public` (e.g. `/uploads` at the project root), with type/size validation. Documents must not be publicly web-accessible. No cloud storage service needed for the initial build.
- **PDF generation** for "Print Admission Form" – `@react-pdf/renderer` or `pdf-lib`.
- **Tables** – TanStack Table for sorting/filtering/pagination on admissions/students lists.

## 1a. Hosting & Deployment (Hostinger Business)

- **Single server, single app.** Hostinger Business hosting supports Node.js app hosting directly through hPanel, alongside MySQL 8 databases on the same account. Everything runs together — no separate VPS, no external database service.
- **Database connection** uses `localhost` (same server as the app), avoiding shared-hosting remote MySQL connection limits entirely. Connection string lives in `.env` as `DATABASE_URL` (Prisma format), never committed to git.
- **Deployment flow**: build the Next.js app (`next build`), deploy via hPanel's Node.js app manager (it manages the process for you — no manual PM2/nginx setup needed on Business plan).
- **File uploads** go to a folder outside the public web root on the same server (not synced to any external bucket).
- **Backups**: rely on Hostinger's built-in MySQL backup/export tools (phpMyAdmin export or hPanel backup feature) — schedule periodic manual or automated backups since this is the only copy of admissions data.

## 2. User Roles & Permissions

### Roles
- Super Admin
- Admin

### Permission Matrix

| Permission | Super Admin | Admin |
|---|---|---|
| Manage Admin Users | ✅ | ❌ |
| Manage Courses | ✅ | ❌ |
| Manage Universities | ✅ | ❌ |
| Manage Admission Sessions | ✅ | ❌ |
| Manage Settings | ✅ | ❌ |
| Manage Forms | ✅ | ❌ |
| Delete Admissions | ✅ | ❌ |
| View Reports | ✅ | ✅ |
| Login / Dashboard | ✅ | ✅ |
| Create Admission | ✅ | ✅ |
| Edit Admission | ✅ | ✅ |
| Upload Documents | ✅ | ✅ |
| Submit Admission | ✅ | ✅ |
| Print Admission Form | ✅ | ✅ |

Permissions are stored in a `role_permissions` join table (not hardcoded), so new roles (e.g. "Verifier", "Accountant") can be added later without code changes.

## 3. Admission Flow

```
Login
  ↓
Dashboard
  ↓
New Admission
  ↓
Select Category (Regular OR Online / ODL)
  ↓
Select Course
  ↓
Regular → Save Lead
Online/ODL → Fill Admission Form → Upload Documents → Payment → Review → Submit
  ↓
Verification
  ↓
Admission Approved
```

### Admission Status Flow

```
Draft → Submitted → Under Verification → (Documents Pending ⇄ Approved | Rejected) → Completed
```

Every status transition writes an `admission_logs` row (old value, new value, actor, timestamp) for a full audit trail.

## 4. Database Design

> Note: the caste/reservation category (General/OBC/SC/ST/EWS/Others) is named `caste_categories` to avoid clashing with `admission_categories` (Regular/Online/ODL), which shared the name "categories" in the original spec.

### 4.1 Access Control

**roles**
| Field | Type |
|---|---|
| id | BIGINT PK |
| role_name | VARCHAR(100) |

Data: Super Admin, Admin

**permissions**
| Field | Type |
|---|---|
| id | BIGINT PK |
| key | VARCHAR(100) |
| label | VARCHAR(150) |

**role_permissions** (many-to-many)
| Field | Type |
|---|---|
| role_id | FK → roles |
| permission_id | FK → permissions |

**users** – stores system users
| Field | Type |
|---|---|
| id | BIGINT PK |
| role_id | FK → roles |
| full_name | VARCHAR(150) |
| email | VARCHAR(150) UNIQUE |
| mobile | VARCHAR(20) |
| password | VARCHAR(255) (hashed) |
| status | ENUM(active, inactive) |
| last_login_at | DATETIME |
| created_at | DATETIME |
| updated_at | DATETIME |

### 4.2 Master / Lookup Tables

**admission_categories**
| id | category_name |
|---|---|
| - | Regular |
| - | Online |
| - | ODL |

**course_types**
Examples: Undergraduate, Postgraduate

**admission_sessions**
| id | session |
|---|---|
| - | 2025 |
| - | 2026 |
| - | 2027 |

Includes `is_active` flag for the current default session.

**faculties**
Examples: Arts, Commerce, Education, Management, Science, Computer Applications

**streams**
Examples: Computer Science, Mathematics, English, Commerce, Political Science, History, Education

**religions**
Hindu, Muslim, Christian, Sikh, Others

**caste_categories**
General, OBC, SC, ST, EWS, Others

**countries**
Initially: India

**states**
All Indian States (FK → countries)

**districts**
Districts of all Indian States (FK → states)

**document_types** – table instead of hardcoded enum, so Super Admin can add new types without a code change
Photo, Signature, Aadhaar, 10th Marksheet, 12th Marksheet, Graduation, Migration, TC, Category Certificate, Employment Proof, Others

### 4.3 Core Tables

**universities**
| Field | Type |
|---|---|
| id | BIGINT PK |
| university_name | VARCHAR(200) |
| logo | VARCHAR(255) |
| address | TEXT |
| website | VARCHAR(255) |
| status | ENUM(active, inactive) |

**courses**
| Field | Type |
|---|---|
| id | BIGINT PK |
| university_id | FK → universities (nullable) |
| admission_category_id | FK → admission_categories |
| course_type_id | FK → course_types |
| course_name | VARCHAR(150) |
| eligibility | VARCHAR(255) |
| duration | VARCHAR(50) |
| semesters | INT |
| yearly_fee | DECIMAL(10,2) |
| status | ENUM(active, inactive) |

Example rows:
| Category | Course |
|---|---|
| Regular | B.Ed |
| Regular | D.El.Ed |
| Regular | M.Ed |
| Online | BCA |
| ODL | MBA |
| Online | MCA |

**students** – one record per student, reused across admissions
| Field | Type |
|---|---|
| id | BIGINT PK |
| student_code | VARCHAR(30) UNIQUE |
| full_name | VARCHAR(150) |
| father_name | VARCHAR(150) |
| mother_name | VARCHAR(150) |
| dob | DATE |
| gender | ENUM |
| caste_category_id | FK → caste_categories |
| religion_id | FK → religions |
| marital_status | VARCHAR(30) |
| employment_status | VARCHAR(50) |
| aadhaar | VARCHAR(20) |
| abc_id | VARCHAR(30) |
| mobile | VARCHAR(20) |
| alternate_mobile | VARCHAR(20) |
| email | VARCHAR(150) |
| alternate_email | VARCHAR(150) |
| address | TEXT |
| city | VARCHAR(100) |
| district_id | FK → districts |
| state_id | FK → states |
| country_id | FK → countries |
| pincode | VARCHAR(10) |
| created_by | FK → users |
| created_at | DATETIME |
| updated_at | DATETIME |

**admissions** – one student can have multiple admissions
| Field | Type |
|---|---|
| id | BIGINT PK |
| admission_no | VARCHAR(30) UNIQUE |
| student_id | FK → students |
| university_id | FK → universities |
| admission_category_id | FK → admission_categories |
| course_id | FK → courses |
| admission_session_id | FK → admission_sessions |
| admission_type | VARCHAR(50) |
| faculty_id | FK → faculties (nullable) |
| stream_id | FK → streams (nullable) |
| semester | INT |
| registration_fee | DECIMAL(10,2) |
| payment_status | ENUM(pending, paid, failed) |
| admission_status | ENUM(draft, submitted, under_verification, documents_pending, approved, rejected, completed) |
| remarks | TEXT |
| created_by | FK → users |
| created_at | DATETIME |
| updated_at | DATETIME |

**academic_records** – educational history
| Field | Type |
|---|---|
| id | BIGINT PK |
| student_id | FK → students |
| qualification | ENUM(10th, 12th, Graduation, Post Graduation) |
| board_university | VARCHAR(200) |
| passing_year | YEAR |
| percentage | DECIMAL(5,2) |
| cgpa | DECIMAL(4,2) |
| roll_no | VARCHAR(50) |
| registration_no | VARCHAR(50) |

**student_documents**
| Field | Type |
|---|---|
| id | BIGINT PK |
| student_id | FK → students |
| admission_id | FK → admissions |
| document_type_id | FK → document_types |
| file_path | VARCHAR(255) |
| verified | BOOLEAN |
| uploaded_at | DATETIME |

**payments**
| Field | Type |
|---|---|
| id | BIGINT PK |
| admission_id | FK → admissions |
| amount | DECIMAL(10,2) |
| payment_mode | VARCHAR(50) |
| transaction_no | VARCHAR(100) |
| payment_date | DATETIME |
| receipt_no | VARCHAR(50) |
| payment_status | ENUM(pending, paid, failed) |

### 4.4 Activity / Audit Tables

**admission_logs**
| Field | Type |
|---|---|
| id | BIGINT PK |
| admission_id | FK → admissions |
| action | VARCHAR(100) |
| old_value | JSON |
| new_value | JSON |
| created_by | FK → users |
| created_at | DATETIME |

**notifications**
| Field | Type |
|---|---|
| id | BIGINT PK |
| user_id | FK → users (nullable) |
| title | VARCHAR(150) |
| message | TEXT |
| type | VARCHAR(50) |
| is_read | BOOLEAN |
| created_at | DATETIME |

**admission_number_sequences** – one row per session, updated atomically (`SELECT ... FOR UPDATE`) to generate unique admission numbers safely under concurrent writes
| Field | Type |
|---|---|
| session_id | FK → admission_sessions |
| last_number | BIGINT |

Same pattern applies to `student_code` generation (e.g. `CI-STU-000001`).

**settings** – key-value store for site-wide config
| Field | Type |
|---|---|
| key | VARCHAR(100) UNIQUE |
| value | TEXT |

## 5. Dashboard Reports

- Total Admissions
- Today's Admissions
- Pending Admissions
- Approved Admissions
- Rejected Admissions
- University-wise Admissions
- Course-wise Admissions
- Monthly Admissions
- Revenue Report

## 6. Search Filters

- Admission Number
- Student Name
- Mobile
- Aadhaar
- ABC ID
- University
- Course
- Admission Session
- Admission Status
- Date

## 7. Project Structure (Routes)

```
app/
  (admin)/
    admin/
      login/page.tsx
      layout.tsx                 ← session check + role guard
      page.tsx                   ← dashboard
      admissions/
        new/page.tsx             ← category → course → form wizard
        draft/page.tsx
        submitted/page.tsx
        approved/page.tsx
        rejected/page.tsx
        page.tsx                 ← all admissions + filters
        [id]/page.tsx             ← detail / edit / verify
      students/
        page.tsx
        [id]/page.tsx
      universities/page.tsx
      courses/page.tsx
      masters/
        sessions/
        faculties/
        streams/
        states/
        districts/
        caste-categories/
        religions/
        document-types/
      payments/page.tsx
      reports/page.tsx
      users/page.tsx             ← Super Admin only
      settings/page.tsx          ← Super Admin only
  api/
    admin/
      auth/[...nextauth]/route.ts
      admissions/route.ts + [id]/route.ts
      students/route.ts + [id]/route.ts
      documents/upload/route.ts
      payments/route.ts
      reports/route.ts
      ...
lib/
  auth.ts        ← Auth.js config
  prisma.ts      ← Prisma client singleton
  rbac.ts        ← permission-check helper used in route handlers
prisma/
  schema.prisma
  seed.ts        ← seeds roles, permissions, master data, course catalog
```

## 8. Recommended Improvements (applied to schema above)

- Normalize course data: separate Course Category (Regular/Online/ODL) from Course, and link each course to a University where applicable.
- Use master tables for dropdown values (religion, caste category, states, districts, admission sessions, faculties, streams, document types) instead of hardcoding them.
- Generate unique admission numbers automatically (e.g. `CI2026-000123`) and unique student codes, via the `admission_number_sequences` table.
- Keep admissions and student profiles separate, so a returning student doesn't need to re-enter personal details for a new admission.

With this structure, the MySQL database should comfortably support 50,000–100,000+ admissions and provide a foundation for future features like a student portal, fee installments, document verification, and CRM integration.

## 9. Course Catalog (seed data)

### Regular

| Course Name | Eligibility | Duration | Yearly Fee |
|---|---|---|---|
| B.Ed | Graduation | 2 Years | Configurable |
| D.El.Ed | 12th | 2 Years | Configurable |
| M.Ed | B.Ed | 2 Years | Configurable |
| B.P.Ed | Graduation | 2 Years | Configurable |
| Special B.Ed | Graduation | 2 Years | Configurable |
| Special D.El.Ed | 12th | 2 Years | Configurable |

### Online

| Course Name | Eligibility | Duration | Semesters | Yearly Fee |
|---|---|---|---|---|
| Bachelor of Arts (BA) | 12th | 3 Years | 6 | ₹10,000 |
| Bachelor of Business Administration (BBA) | 12th | 3 Years | 6 | ₹18,000 |
| Bachelor of Computer Applications (BCA) | 12th | 3 Years | 6 | ₹20,000 |
| Master of Arts (English) | Graduation | 2 Years | 4 | ₹14,000 |
| Master of Arts (Political Science) | Graduation | 2 Years | 4 | ₹14,000 |
| Master of Arts (Journalism & Mass Communication) | Graduation | 2 Years | 4 | ₹14,000 |
| Master of Arts (Education) | Graduation | 2 Years | 4 | ₹14,000 |
| Master of Arts (Public Administration) | Graduation | 2 Years | 4 | ₹14,000 |
| Master of Commerce (M.Com) | Graduation | 2 Years | 4 | ₹14,000 |
| Master of Science (Mathematics) | Graduation in Relevant Field | 2 Years | 4 | ₹24,000 |
| MBA (Human Resource Management) | Graduation | 2 Years | 4 | ₹30,000 |
| MBA (Marketing Management) | Graduation | 2 Years | 4 | ₹30,000 |
| MBA (Operations Management) | Graduation | 2 Years | 4 | ₹30,000 |
| MBA (Finance Management) | Graduation | 2 Years | 4 | ₹30,000 |
| Master of Computer Applications (MCA) | Graduation | 2 Years | 4 | ₹30,000 |

### ODL

| Course Name | Eligibility | Duration | Semesters | Yearly Fee |
|---|---|---|---|---|
| Bachelor of Arts (BA) | 12th | 3 Years | 6 | ₹8,000 |
| Bachelor of Commerce (B.Com) | 12th | 3 Years | 6 | ₹8,000 |
| Bachelor of Science (PCB/PCM/ZBC) | 12th | 3 Years | 6 | ₹8,000 |
| Bachelor of Library & Information Science (B.Lib.) | Graduation | 1 Year | 2 | ₹20,000 |
| Bachelor of Arts (Journalism & Mass Communication) | 12th | 3 Years | 6 | ₹14,000 |
| Master of Arts (Sociology) | Graduation | 2 Years | 4 | ₹14,000 |
| Master of Arts (History) | Graduation | 2 Years | 4 | ₹14,000 |
| Master of Arts (Economics) | Graduation | 2 Years | 4 | ₹14,000 |
| Master of Science (Physics) | Graduation in Relevant Field | 2 Years | 4 | ₹24,000 |
| Master of Science (Chemistry) | Graduation in Relevant Field | 2 Years | 4 | ₹24,000 |
| MBA (HR, Marketing, Finance, Operations) | Graduation | 2 Years | 4 | ₹28,000 |
| Master of Library Science (M.Lib.) | B.Lib. | 1 Year | 2 | ₹20,000 |
| MBA (Tourism & Hospitality Management) | Graduation | 2 Years | 4 | ₹36,000 |

## 10. Suggested Build Order

1. Prisma schema + MySQL connection + migrations + seed (roles, permissions, master data, course catalog)
2. Auth (login, session, RBAC middleware) + admin layout/guard
3. Masters CRUD (sessions, faculties, streams, states/districts, universities, courses)
4. Student + Admission core flow (new admission wizard: category → course → form → save draft)
5. Document upload + verification
6. Payments
7. Admission status workflow + audit logs
8. Dashboard + reports (aggregate queries)
9. Print admission form (PDF), search/filters polish

## 11. Getting Started (Local Development)

Scaffolding completed so far: Prisma schema, seed script, Auth.js credentials login, RBAC helper, `/admin` route guard (middleware), login page, and a minimal dashboard.

1. Install a local MySQL 8 server (or run one via Docker: `docker run --name chahar-mysql-dev -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=chahar_institute -p 3306:3306 mysql:8.0`).
2. Copy `.env.example` to `.env` and fill in `DATABASE_URL` with your local MySQL credentials. Generate `AUTH_SECRET` with `npx auth secret`.
3. Run `npm run db:migrate` to create tables (Prisma will prompt for a migration name on first run).
4. Run `npm run db:seed` to seed roles, permissions, master data, and the course catalog. This also creates an initial Super Admin login — printed to the console (`admin@chaharinstitute.com` / `ChangeMe@123`). **Change this password immediately after first login.**
5. Run `npm run dev` and visit `/admin/login`.

Notes on the stack decision: pinned to **Prisma 6.19.3** rather than 7.x. Prisma 7 requires mandatory driver adapters, ESM-first modules, a separate `prisma.config.ts`, and custom generated client output paths — more moving parts than needed for a shared-hosting (Hostinger) deployment. Prisma 6 keeps the classic setup (`url` in `schema.prisma`, plain `PrismaClient` import) which is simpler to deploy and debug.

## 12. Decisions Locked In

1. **Hosting**: Hostinger Business plan — Node.js app hosting (via hPanel) + MySQL 8, same server, same account. Keeps everything in one place.
2. **Stack**: Auth.js + Prisma + MySQL, confirmed.
3. **File uploads**: local disk under a non-public folder, no cloud storage for now.
4. **Admin panel location**: inside this same Next.js project under `/admin` routes — not a separate app.
