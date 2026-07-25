import { Metadata } from "next";
import { CourseCard } from "@/components/sections/course-card";
import { ContactCTA } from "@/components/sections/contact-cta";
import { getPublicCourses, categoryAccent } from "@/lib/public-courses";

export const metadata: Metadata = {
  title: "Courses",
  description: "Explore regular and distance courses including B.Ed, MBA, BCA, MCA, BA, MA and more through recognized universities.",
};

const cardBgs = [
  "#F0EDE7", "#E8F0ED", "#F5EFE0", "#EEF2F7",
  "#F0EDE7", "#E8F0ED", "#F5EFE0", "#EEF2F7",
];

export default async function CoursesPage() {
  const courses = await getPublicCourses();
  const regular = courses.filter((c) => c.categoryName === "Regular");
  const distance = courses.filter((c) => c.categoryName === "Online");

  const groups = [
    { key: "Regular", label: "Regular Courses", items: regular },
    { key: "Online", label: "Distance Courses", items: distance },
  ].filter((g) => g.items.length > 0);

  return (
    <div>
      <section className="bg-[#013220] text-center text-white" style={{ paddingTop: "calc(80px + 48px)", paddingBottom: "48px" }}>
        <div className="max-w-7xl mx-auto px-5">
          <h1 className="font-bold text-white mb-2" style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)" }}>Our Courses</h1>
          <p className="text-white/75 text-[0.9rem]">Regular and distance programs from top universities</p>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
          {groups.map((group) => (
            <div key={group.key} className="mb-14 last:mb-0">
              <div className="flex items-center gap-2.5 mb-7">
                <div
                  className="h-[2px] w-5 rounded-full"
                  style={{ background: categoryAccent(group.key) }}
                />
                <span
                  className="text-[0.68rem] font-bold uppercase tracking-[0.2em]"
                  style={{ color: categoryAccent(group.key) }}
                >
                  {group.label}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {group.items.map((c, i) => (
                  <CourseCard
                    key={c.id}
                    slug={c.slug}
                    name={c.courseName}
                    duration={c.duration ?? ""}
                    eligibility={c.eligibility ?? ""}
                    description={c.description ?? `${c.courseName}${c.facultyName ? ` — ${c.facultyName}` : ""}`}
                    accentColor={categoryAccent(group.key)}
                    cardBg={cardBgs[i % cardBgs.length]}
                    index={i}
                  />
                ))}
              </div>
            </div>
          ))}

          {groups.length === 0 && (
            <p className="text-center text-[#6B7280] text-sm">
              Courses will appear here once they are added in the admin panel.
            </p>
          )}
        </div>
      </section>

      <ContactCTA />
    </div>
  );
}
