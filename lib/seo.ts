/**
 * Single source of truth for the production domain — used by metadata,
 * sitemap.ts, robots.ts, and structured data. Update here only if the
 * domain ever changes.
 */
export const SITE_URL = "https://chaharinstitute.online";
export const SITE_NAME = "Chahar Institute";

/** Organization JSON-LD — shown on every page via the root layout. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logoWTB.png`,
    description:
      "Chahar Institute is a UP B.Ed college and D.El.Ed college admission partner in Agra, offering expert guidance for B.Ed, D.El.Ed, MBA, BCA, MCA and other distance courses through UGC-recognised universities.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Agra",
      addressRegion: "Uttar Pradesh",
      addressCountry: "IN",
    },
    areaServed: {
      "@type": "State",
      name: "Uttar Pradesh",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-90506-23550",
      contactType: "admissions",
      email: "chaharinstitute@gmail.com",
      areaServed: "IN",
    },
  };
}

/** Course JSON-LD for a single course detail page. */
export function courseJsonLd(course: {
  courseName: string;
  description: string | null;
  categoryName: string;
  duration: string | null;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.courseName,
    description:
      course.description ?? `${course.courseName} — ${course.categoryName} program at Chahar Institute.`,
    provider: {
      "@type": "EducationalOrganization",
      name: SITE_NAME,
      sameAs: SITE_URL,
    },
    url: `${SITE_URL}/courses/${course.slug}`,
    ...(course.duration ? { timeRequired: course.duration } : {}),
  };
}

/** BlogPosting JSON-LD for a single blog detail page. */
export function blogPostingJsonLd(blog: {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  slug: string;
  image: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt,
    datePublished: blog.date,
    author: { "@type": "Person", name: blog.author },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${SITE_URL}/logoWTB.png` },
    },
    image: `${SITE_URL}${blog.image}`,
    mainEntityOfPage: `${SITE_URL}/blog/${blog.slug}`,
  };
}

/** BreadcrumbList JSON-LD — pass an ordered list of { name, path } segments. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
