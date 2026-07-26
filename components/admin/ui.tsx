import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ── Brand tokens used across the admin panel ──────────────────────────
   canvas  #FDFBF7   hairline #E5E1D8   ink   #1A1A1A
   muted   #6B7280   faint    #9CA3AF   gold  #C5A059   green #013220
   ─────────────────────────────────────────────────────────────────── */

/** Page title + optional subtitle and right-aligned actions. */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">{title}</h1>
        {subtitle && <p className="text-sm text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/** White rounded surface with a hairline border — the panel used everywhere. */
export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-white border border-[#E5E1D8] rounded-xl shadow-[0_1px_2px_rgba(1,50,32,0.04)]",
        padded && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Titled group of fields inside a form card, with a subtle gold accent rule. */
export function FormSection({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.08em] text-[#1A1A1A]">
          <span className="h-[2px] w-5 rounded-full bg-[#C5A059]" />
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

/** Label above an input/select, with an optional required marker. */
export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#374151]">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children}
      {hint && <span className="text-[0.7rem] text-[#9CA3AF]">{hint}</span>}
    </div>
  );
}

/** Shared control styling so inputs and selects line up exactly. */
export const controlClass =
  "h-9 w-full rounded-lg border border-[#E5E1D8] bg-white px-3 text-sm text-[#1A1A1A] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#C5A059] focus:ring-2 focus:ring-[#C5A059]/20 disabled:bg-[#FDFBF7] disabled:text-[#9CA3AF]";

// `.admin-select` (globals.css) supplies the chevron background, since
// `appearance-none` strips the browser's own dropdown arrow.
export const selectClass = cn(controlClass, "admin-select cursor-pointer appearance-none pr-9");

/* ── Table primitives ─────────────────────────────────────────────── */

export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <div className="bg-white border border-[#E5E1D8] rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(1,50,32,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "bg-[#FDFBF7] px-4 py-3 text-left text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-[#6B7280] border-b border-[#E5E1D8]",
        className
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle text-[#374151]", className)}>{children}</td>;
}

export function Tr({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <tr className={cn("border-b border-[#F0EDE7] last:border-0 hover:bg-[#FDFBF7]/70 transition-colors", className)}>
      {children}
    </tr>
  );
}

/** Full-width row shown when a table has no data or is loading. */
export function TableEmpty({
  colSpan,
  children,
  icon,
}: {
  colSpan: number;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-12 text-center">
        <div className="flex flex-col items-center gap-2 text-[#9CA3AF]">
          {icon}
          <span className="text-sm">{children}</span>
        </div>
      </td>
    </tr>
  );
}

/* ── Badges ───────────────────────────────────────────────────────── */

const BADGE_TONES = {
  neutral: "bg-[#F3F4F6] text-[#4B5563]",
  info: "bg-blue-50 text-blue-700",
  warn: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  success: "bg-green-50 text-green-700",
  gold: "bg-[#C5A059]/12 text-[#8a6d31]",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium capitalize",
        BADGE_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const ADMISSION_STATUS_TONE: Record<string, BadgeTone> = {
  draft: "neutral",
  submitted: "info",
  under_verification: "warn",
  documents_pending: "warn",
  approved: "success",
  rejected: "danger",
  completed: "success",
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={ADMISSION_STATUS_TONE[status] ?? "neutral"}>{status.replace(/_/g, " ")}</Badge>;
}

/** Clickable active/inactive pill used on master + course rows. */
export function StatusToggle({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Click to toggle"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium capitalize transition-colors",
        active
          ? "bg-green-50 text-green-700 hover:bg-green-100"
          : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-green-600" : "bg-[#9CA3AF]")} />
      {active ? "active" : "inactive"}
    </button>
  );
}
