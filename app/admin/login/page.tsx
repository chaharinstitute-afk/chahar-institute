"use client";

import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle } from "lucide-react";
import { controlClass } from "@/components/admin/ui";

// Known admin routes a post-login redirect is allowed to land on.
// Anything else (stale bookmarks, typos, tampered links) falls back to the dashboard
// instead of bouncing the user straight into a 404.
const SAFE_CALLBACK_PREFIXES = [
  "/admin/admissions",
  "/admin/courses",
  "/admin/masters",
  "/admin/users",
];

function resolveSafeCallbackUrl(raw: string | null): string {
  if (!raw) return "/admin";
  // Must be a same-app relative path, not an absolute/external URL.
  if (!raw.startsWith("/admin") || raw.startsWith("//")) return "/admin";
  if (raw === "/admin" || raw === "/admin/") return "/admin";
  if (raw === "/admin/login") return "/admin";
  if (SAFE_CALLBACK_PREFIXES.some((prefix) => raw.startsWith(prefix))) return raw;
  return "/admin";
}

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = resolveSafeCallbackUrl(searchParams.get("callbackUrl"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    // A hard navigation (not router.push) so the server-rendered admin layout
    // re-runs auth() with the fresh session cookie and renders the sidebar
    // immediately, instead of reusing the pre-login layout shell.
    window.location.href = callbackUrl;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Image
            src="/logoWTR.png"
            alt="Chahar Institute"
            width={260}
            height={160}
            className="mx-auto h-24 w-auto object-contain"
            priority
          />
          <p className="mt-3 text-sm text-[#6B7280]">Admission panel sign in</p>
        </div>

        <div className="rounded-xl border border-[#E5E1D8] bg-white p-6 shadow-[0_1px_3px_rgba(1,50,32,0.06)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-[#374151]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@chaharinstitute.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={controlClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-xs font-medium text-[#374151]">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={controlClass}
              />
            </div>

            {error && (
              <p className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-lg bg-[#1A1A1A] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#013220] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
