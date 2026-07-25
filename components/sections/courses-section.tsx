import { PillButton } from "@/components/shared/pill-button";
import { CourseCard } from "@/components/sections/course-card";
import { getPublicCourses, categoryAccent } from "@/lib/public-courses";

/* Alternating card backgrounds for visual rhythm */
const cardBgs = [
  "#F0EDE7", "#E8F0ED", "#F5EFE0", "#EEF2F7",
  "#F0EDE7", "#E8F0ED", "#F5EFE0", "#EEF2F7",
  "#F0EDE7", "#E8F0ED",
];

/**
 * Homepage teaser — pulls live course data from the admin panel's Course
 * Names catalog. "Regular" courses are on-campus; "Online" courses are shown
 * to visitors as "Distance Courses". ODL is excluded from the public site.
 */
export async function CoursesSection() {
  const courses = await getPublicCourses();
  const regular = courses.filter((c) => c.categoryName === "Regular").slice(0, 4);
  const distance = courses.filter((c) => c.categoryName === "Online").slice(0, 6);

  return (
    <section className="py-20 md:py-28 bg-[#FDFBF7]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* Heading */}
        <div className="mb-14">
          <div className="h-[3px] w-8 rounded-full bg-[#C5A059] mb-3" />
          <h2 className="text-[1.75rem] md:text-[2.1rem] font-bold text-[#1A1A1A] tracking-tight mb-2">
            Our Courses
          </h2>
          <p className="text-[#6B7280] text-[0.9rem]">
            Regular and distance programs from UGC‑recognised universities
          </p>
        </div>

        {/* Regular */}
        {regular.length > 0 && (
          <div className="mb-14">
            <div className="flex items-center gap-2.5 mb-7">
              <div className="h-[2px] w-5 rounded-full bg-[#013220]" />
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#013220]">
                Regular Courses
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {regular.map((c, i) => (
                <CourseCard
                  key={c.id}
                  slug={c.slug}
                  name={c.courseName}
                  duration={c.duration ?? ""}
                  eligibility={c.eligibility ?? ""}
                  description={c.description ?? `${c.courseName}${c.facultyName ? ` — ${c.facultyName}` : ""}`}
                  accentColor={categoryAccent(c.categoryName)}
                  cardBg={cardBgs[i]}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}

        {/* Distance */}
        {distance.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2.5 mb-7">
              <div className="h-[2px] w-5 rounded-full bg-[#C5A059]" />
              <span className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#C5A059]">
                Distance Courses
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {distance.map((c, i) => (
                <CourseCard
                  key={c.id}
                  slug={c.slug}
                  name={c.courseName}
                  duration={c.duration ?? ""}
                  eligibility={c.eligibility ?? ""}
                  description={
                    c.description ?? `${c.courseName} — ${c.categoryName}${c.facultyName ? ` · ${c.facultyName}` : ""}`
                  }
                  accentColor={categoryAccent(c.categoryName)}
                  cardBg={cardBgs[i + 4]}
                  index={i}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          <PillButton href="/courses" variant="dark" arrow="↗">
            View All Courses
          </PillButton>
        </div>
      </div>
    </section>
  );
}
