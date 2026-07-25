interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}

export function SectionTitle({ title, subtitle, align = "center" }: SectionTitleProps) {
  const isCenter = align === "center";
  return (
    <div className={`mb-14 ${isCenter ? "text-center" : ""}`}>
      {/* Gold bar accent */}
      <div className={`flex mb-4 ${isCenter ? "justify-center" : "justify-start"}`}>
        <div className="h-[3px] w-10 rounded-full bg-[#C5A059]" />
      </div>
      <h2
        className="text-[1.85rem] md:text-[2.25rem] font-bold text-[#1A1A1A] leading-tight tracking-tight mb-3"
      >
        {title}
      </h2>
      {subtitle && (
        <p className={`text-[#6B7280] text-[0.95rem] leading-relaxed ${isCenter ? "max-w-lg mx-auto" : "max-w-lg"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
