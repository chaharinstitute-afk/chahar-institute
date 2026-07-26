/**
 * Maps a blog post's related course to an actual image file in
 * `public/blogs/`. Files there are named after the course they cover
 * (e.g. `bca.jpg`, `mca.jpg`, `M.ed.jpg`, `diploma dled.jpg`) rather than
 * per-post — so we match by normalizing both the course name and the known
 * filenames down to lowercase alphanumerics and looking up from there.
 *
 * Posts whose related course has no matching file (e.g. B.Ed, MBA, BBA) fall
 * back to one of the generic `blog1.jpg`–`blog5.jpg` images, cycling by the
 * post's position so consecutive fallback posts don't all show the same one.
 */

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Keys are normalized course-name fragments; values are the exact filename
// (space-encoded) under public/blogs/.
const COURSE_IMAGE_MAP: Record<string, string> = {
  bca: "bca.jpg",
  bsc: "bsc.jpg",
  deled: "diploma%20dled.jpg",
  med: "M.ed.jpg",
  mca: "mca.jpg",
  msc: "msc.jpg",
};

const FALLBACK_POOL = ["blog1.jpg", "blog2.jpg", "blog3.jpg", "blog4.jpg", "blog5.jpg"];

export function resolveBlogImage(relatedCourse: string, fallbackIndex: number): string {
  const key = normalize(relatedCourse);
  const matched = COURSE_IMAGE_MAP[key];
  if (matched) return `/blogs/${matched}`;

  const fallback = FALLBACK_POOL[fallbackIndex % FALLBACK_POOL.length];
  return `/blogs/${fallback}`;
}
