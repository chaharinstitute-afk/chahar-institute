import Link from "next/link";
import { ReactNode } from "react";

interface PillButtonProps {
  href: string;
  children: ReactNode;
  variant?: "dark" | "light";
  arrow?: string;
  onClick?: () => void;
  className?: string;
}

/**
 * Pill‑style button matching the reference design:
 * pill container → label text → circular accent dot with arrow
 *
 * variant="dark"  → green bg, gold circle (primary CTA)
 * variant="light" → white bg, gold circle (secondary CTA)
 */
export function PillButton({
  href,
  children,
  variant = "light",
  arrow = "→",
  className = "",
}: PillButtonProps) {
  const isDark = variant === "dark";

  return (
    <Link
      href={href}
      className={[
        "btn-pill",
        isDark ? "btn-pill-dark" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="btn-pill-label">{children}</span>
      <span className="btn-pill-circle">{arrow}</span>
    </Link>
  );
}

/** Inline submit / button element version (for forms, etc.) */
interface PillSubmitProps {
  children: ReactNode;
  variant?: "dark" | "light";
  arrow?: string;
  className?: string;
  disabled?: boolean;
}

export function PillSubmit({
  children,
  variant = "dark",
  arrow = "→",
  className = "",
  disabled = false,
}: PillSubmitProps) {
  const isDark = variant === "dark";
  return (
    <button
      type="submit"
      disabled={disabled}
      className={[
        "btn-pill w-full",
        isDark ? "btn-pill-dark" : "",
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="btn-pill-label">{children}</span>
      <span className="btn-pill-circle">{arrow}</span>
    </button>
  );
}
