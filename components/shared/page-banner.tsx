/**
 * Shared page banner — used on all inner pages.
 * Equal padding above/below, large white text, consistent look.
 */
export function PageBanner({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <section
      className="bg-[#013220] text-center text-white"
      style={{ paddingTop: "calc(80px + 48px)", paddingBottom: "48px" }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <h1
          className="font-bold text-white mb-2"
          style={{ fontSize: "clamp(1.8rem, 3vw, 2.4rem)", lineHeight: 1.15 }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-white/75 text-[0.95rem]">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
