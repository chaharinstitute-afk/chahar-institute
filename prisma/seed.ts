/**
 * Seed script — roles, permissions, master data, and the initial course catalog.
 * Run with: npx prisma db seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PERMISSIONS } from "../lib/rbac";

const prisma = new PrismaClient();

async function seedRolesAndPermissions() {
  const permissionEntries = Object.entries(PERMISSIONS).map(([, key]) => ({
    key,
    label: key
      .split("_")
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" "),
  }));

  for (const p of permissionEntries) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: { label: p.label },
      create: p,
    });
  }

  const superAdminRole = await prisma.role.upsert({
    where: { roleName: "Super Admin" },
    update: {},
    create: { roleName: "Super Admin" },
  });

  const adminRole = await prisma.role.upsert({
    where: { roleName: "Admin" },
    update: {},
    create: { roleName: "Admin" },
  });

  const allPermissions = await prisma.permission.findMany();

  // Super Admin gets every permission
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: perm.id },
    });
  }

  // Admin gets the operational subset (no user/master management, no delete, view reports yes)
  const adminPermissionKeys: string[] = [
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.CREATE_ADMISSION,
    PERMISSIONS.EDIT_ADMISSION,
    PERMISSIONS.UPLOAD_DOCUMENTS,
    PERMISSIONS.SUBMIT_ADMISSION,
    PERMISSIONS.PRINT_ADMISSION_FORM,
    // manage_leads / manage_testimonials intentionally excluded — Super Admin only.
  ];
  const adminPerms = allPermissions.filter((p) => adminPermissionKeys.includes(p.key));
  for (const perm of adminPerms) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  return { superAdminRole, adminRole };
}

async function seedInitialSuperAdmin(superAdminRoleId: bigint) {
  const email = "admin@chaharinstitute.com";
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return;

  const passwordHash = await bcrypt.hash("ChangeMe@123", 10);
  await prisma.user.create({
    data: {
      roleId: superAdminRoleId,
      fullName: "Super Admin",
      email,
      password: passwordHash,
      status: "active",
    },
  });
  console.log(`Seeded initial Super Admin login: ${email} / ChangeMe@123 (change immediately)`);
}

async function seedMasters() {
  // Admission categories
  const categoryNames = ["Regular", "Online", "ODL"];
  const categories: Record<string, { id: bigint }> = {};
  for (const name of categoryNames) {
    categories[name] = await prisma.admissionCategory.upsert({
      where: { categoryName: name },
      update: {},
      create: { categoryName: name },
    });
  }

  // Course types
  for (const name of ["Diploma", "Undergraduate", "Post Graduate", "Post Graduate Diploma"]) {
    await prisma.courseType.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Admission sessions.
  // Regular category runs a single annual intake ("Annual").
  // Online and ODL run two intakes per year — January and July.
  const years = ["2025", "2026", "2027"];
  for (const year of years) {
    await prisma.admissionSession.upsert({
      where: { session_sessionType: { session: year, sessionType: "Annual" } },
      update: {},
      create: { session: year, sessionType: "Annual", isActive: year === "2026" },
    });
    for (const intake of ["January", "July"]) {
      await prisma.admissionSession.upsert({
        where: { session_sessionType: { session: year, sessionType: intake } },
        update: {},
        create: {
          session: year,
          sessionType: intake,
          isActive: year === "2026" && intake === "January",
        },
      });
    }
  }

  // Faculties
  const facultyNames = ["Arts", "Commerce", "Education", "Management", "Science", "Computer Applications"];
  const faculties: Record<string, { id: bigint }> = {};
  for (const name of facultyNames) {
    faculties[name] = await prisma.faculty.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Streams — each linked to the faculty it belongs under, so selecting a faculty
  // in the admission form narrows down the available streams.
  const streamsByFaculty: Record<string, string[]> = {
    Arts: ["English", "History", "Political Science", "Sociology", "Economics"],
    Commerce: ["Commerce", "Accounting & Finance"],
    Education: ["Education"],
    Management: ["Human Resource Management", "Marketing Management", "Finance Management", "Operations Management"],
    Science: ["Mathematics", "Physics", "Chemistry"],
    "Computer Applications": ["Computer Science", "Information Technology"],
  };
  for (const [facultyName, streamNames] of Object.entries(streamsByFaculty)) {
    const faculty = faculties[facultyName];
    for (const name of streamNames) {
      await prisma.stream.upsert({
        where: { name },
        update: { facultyId: faculty.id },
        create: { name, facultyId: faculty.id },
      });
    }
  }

  // Religions
  for (const name of ["Hindu", "Muslim", "Christian", "Sikh", "Others"]) {
    await prisma.religion.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Caste categories
  for (const name of ["General", "OBC", "SC", "ST", "EWS", "Others"]) {
    await prisma.casteCategory.upsert({ where: { name }, update: {}, create: { name } });
  }

  // Country -> India (states/districts left for a follow-up data import — too large to hardcode here)
  await prisma.country.upsert({
    where: { name: "India" },
    update: {},
    create: { name: "India" },
  });

  // Document types
  for (const name of [
    "ABC ID Proof",
    "DEB ID Proof",
    "10th Mark-Sheet (Final)",
    "12th / Diploma Mark-Sheet (Final)",
    "10th Passing Certificate",
    "12th / Diploma Passing Certificate",
    "Graduation Marksheet",
    "Migration Certificate",
    "Transfer Certificate",
    "Category Certificate",
    "Address ID Proof (Front)",
    "Address ID Proof (Back)",
    "Passport Size Photograph",
    "Student Signature",
    "Employment Proof",
    "Other's Document",
  ]) {
    await prisma.documentType.upsert({ where: { name }, update: {}, create: { name } });
  }

  return { categories, faculties };
}

type CourseSeed = {
  name: string;
  eligibility: string;
  duration: string;
  semesters?: number;
  yearlyFee: number | null; // null = "Configurable"
  faculty: string;
};

const REGULAR_COURSES: CourseSeed[] = [
  { name: "B.Ed", eligibility: "Graduation", duration: "2 Years", yearlyFee: null, faculty: "Education" },
  { name: "D.El.Ed", eligibility: "12th", duration: "2 Years", yearlyFee: null, faculty: "Education" },
  { name: "M.Ed", eligibility: "B.Ed", duration: "2 Years", yearlyFee: null, faculty: "Education" },
  { name: "B.P.Ed", eligibility: "Graduation", duration: "2 Years", yearlyFee: null, faculty: "Education" },
  { name: "Special B.Ed", eligibility: "Graduation", duration: "2 Years", yearlyFee: null, faculty: "Education" },
  { name: "Special D.El.Ed", eligibility: "12th", duration: "2 Years", yearlyFee: null, faculty: "Education" },
];

const ONLINE_COURSES: CourseSeed[] = [
  { name: "Bachelor of Arts (BA)", eligibility: "12th", duration: "3 Years", semesters: 6, yearlyFee: 10000, faculty: "Arts" },
  { name: "Bachelor of Business Administration (BBA)", eligibility: "12th", duration: "3 Years", semesters: 6, yearlyFee: 18000, faculty: "Management" },
  { name: "Bachelor of Computer Applications (BCA)", eligibility: "12th", duration: "3 Years", semesters: 6, yearlyFee: 20000, faculty: "Computer Applications" },
  { name: "Master of Arts (English)", eligibility: "Graduation", duration: "2 Years", semesters: 4, yearlyFee: 14000, faculty: "Arts" },
  { name: "Master of Arts (Political Science)", eligibility: "Graduation", duration: "2 Years", semesters: 4, yearlyFee: 14000, faculty: "Arts" },
  { name: "Master of Arts (Journalism & Mass Communication)", eligibility: "Graduation", duration: "2 Years", semesters: 4, yearlyFee: 14000, faculty: "Arts" },
  { name: "Master of Arts (Education)", eligibility: "Graduation", duration: "2 Years", semesters: 4, yearlyFee: 14000, faculty: "Education" },
  { name: "Master of Arts (Public Administration)", eligibility: "Graduation", duration: "2 Years", semesters: 4, yearlyFee: 14000, faculty: "Arts" },
  { name: "Master of Commerce (M.Com)", eligibility: "Graduation", duration: "2 Years", semesters: 4, yearlyFee: 14000, faculty: "Commerce" },
  { name: "Master of Science (Mathematics)", eligibility: "Graduation in Relevant Field", duration: "2 Years", semesters: 4, yearlyFee: 24000, faculty: "Science" },
  { name: "MBA (Human Resource Management)", eligibility: "Graduation", duration: "2 Years", semesters: 4, yearlyFee: 30000, faculty: "Management" },
  { name: "MBA (Marketing Management)", eligibility: "Graduation", duration: "2 Years", semesters: 4, yearlyFee: 30000, faculty: "Management" },
  { name: "MBA (Operations Management)", eligibility: "Graduation", duration: "2 Years", semesters: 4, yearlyFee: 30000, faculty: "Management" },
  { name: "MBA (Finance Management)", eligibility: "Graduation", duration: "2 Years", semesters: 4, yearlyFee: 30000, faculty: "Management" },
  { name: "Master of Computer Applications (MCA)", eligibility: "Graduation", duration: "2 Years", semesters: 4, yearlyFee: 30000, faculty: "Computer Applications" },
];

const ODL_COURSES: CourseSeed[] = [
  { name: "Bachelor of Arts (BA)", eligibility: "12th", duration: "3 Years", semesters: 6, yearlyFee: 8000, faculty: "Arts" },
  { name: "Bachelor of Commerce (B.Com)", eligibility: "12th", duration: "3 Years", semesters: 6, yearlyFee: 8000, faculty: "Commerce" },
  { name: "Bachelor of Science (PCB/PCM/ZBC)", eligibility: "12th", duration: "3 Years", semesters: 6, yearlyFee: 8000, faculty: "Science" },
  { name: "Bachelor of Library & Information Science (B.Lib.)", eligibility: "Graduation", duration: "1 Year", semesters: 2, yearlyFee: 20000, faculty: "Arts" },
  { name: "Bachelor of Arts (Journalism & Mass Communication)", eligibility: "12th", duration: "3 Years", semesters: 6, yearlyFee: 14000, faculty: "Arts" },
  { name: "Master of Arts (Sociology)", eligibility: "Graduation", duration: "2 Years", semesters: 4, yearlyFee: 14000, faculty: "Arts" },
  { name: "Master of Arts (History)", eligibility: "Graduation", duration: "2 Years", semesters: 4, yearlyFee: 14000, faculty: "Arts" },
  { name: "Master of Arts (Economics)", eligibility: "Graduation", duration: "2 Years", semesters: 4, yearlyFee: 14000, faculty: "Arts" },
  { name: "Master of Science (Physics)", eligibility: "Graduation in Relevant Field", duration: "2 Years", semesters: 4, yearlyFee: 24000, faculty: "Science" },
  { name: "Master of Science (Chemistry)", eligibility: "Graduation in Relevant Field", duration: "2 Years", semesters: 4, yearlyFee: 24000, faculty: "Science" },
  { name: "MBA (HR, Marketing, Finance, Operations)", eligibility: "Graduation", duration: "2 Years", semesters: 4, yearlyFee: 28000, faculty: "Management" },
  { name: "Master of Library Science (M.Lib.)", eligibility: "B.Lib.", duration: "1 Year", semesters: 2, yearlyFee: 20000, faculty: "Arts" },
  { name: "MBA (Tourism & Hospitality Management)", eligibility: "Graduation", duration: "2 Years", semesters: 4, yearlyFee: 36000, faculty: "Management" },
];

async function seedCourses(
  categories: Record<string, { id: bigint }>,
  faculties: Record<string, { id: bigint }>
) {
  const undergraduate = await prisma.courseType.findUniqueOrThrow({ where: { name: "Undergraduate" } });
  const postgraduate = await prisma.courseType.findUniqueOrThrow({ where: { name: "Post Graduate" } });
  const diploma = await prisma.courseType.findUniqueOrThrow({ where: { name: "Diploma" } });

  const inferCourseType = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("diploma") || lower.startsWith("d.el.ed")) return diploma.id;
    if (
      lower.startsWith("master") ||
      lower.startsWith("mba") ||
      lower.startsWith("m.ed") ||
      lower.includes("m.lib") ||
      lower.startsWith("mca")
    )
      return postgraduate.id;
    return undergraduate.id;
  };

  const upsertCourseList = async (
    list: CourseSeed[],
    categoryId: bigint
  ) => {
    for (const c of list) {
      const existing = await prisma.course.findFirst({
        where: { courseName: c.name, admissionCategoryId: categoryId },
        select: { id: true },
      });

      const data = {
        eligibility: c.eligibility,
        duration: c.duration,
        semesters: c.semesters ?? null,
        universityFee: c.yearlyFee,
        courseTypeId: inferCourseType(c.name),
        facultyId: faculties[c.faculty]?.id ?? null,
      };

      if (existing) {
        await prisma.course.update({ where: { id: existing.id }, data });
      } else {
        await prisma.course.create({
          data: {
            courseName: c.name,
            admissionCategoryId: categoryId,
            ...data,
          },
        });
      }
    }
  };

  await upsertCourseList(REGULAR_COURSES, categories["Regular"].id);
  await upsertCourseList(ONLINE_COURSES, categories["Online"].id);
  await upsertCourseList(ODL_COURSES, categories["ODL"].id);
}

async function seedTestimonials() {
  const existing = await prisma.testimonial.count();
  if (existing > 0) return; // don't overwrite content the Super Admin may have edited

  const initialTestimonials = [
    { name: "Priya Sharma", course: "B.Ed", rating: 5, sortOrder: 1, review: "Chahar Institute made my B.Ed admission process incredibly smooth. Their counselors guided me at every step, from document verification to university selection." },
    { name: "Rahul Verma", course: "MBA (Distance)", rating: 5, sortOrder: 2, review: "I was able to complete my MBA while working full-time. The team at Chahar Institute helped me choose the right university and handle all paperwork." },
    { name: "Anita Kumari", course: "D.El.Ed", rating: 4, sortOrder: 3, review: "As a first-generation learner, I had many doubts about distance education. Chahar Institute answered all my questions patiently and helped me get admitted." },
    { name: "Vikash Singh", course: "BCA", rating: 5, sortOrder: 4, review: "The fees were very affordable and the admission process was transparent. I got all my documents processed within a week. Highly recommended!" },
    { name: "Neha Gupta", course: "M.Ed", rating: 5, sortOrder: 5, review: "I wanted to pursue M.Ed for career growth but was confused about universities. Chahar Institute provided expert guidance and I got admitted to a top university." },
    { name: "Amit Kumar", course: "BA (Distance)", rating: 4, sortOrder: 6, review: "Completed my BA through distance mode while working. Chahar Institute made it possible with their efficient admission support and follow-up." },
  ];

  await prisma.testimonial.createMany({ data: initialTestimonials });
}

async function main() {
  const { superAdminRole } = await seedRolesAndPermissions();
  await seedInitialSuperAdmin(superAdminRole.id);
  const { categories, faculties } = await seedMasters();
  await seedCourses(categories, faculties);
  await seedTestimonials();
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
