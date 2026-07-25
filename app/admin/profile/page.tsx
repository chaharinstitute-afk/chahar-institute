"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, KeyRound, Mail, Shield } from "lucide-react";
import {
  Badge,
  Card,
  Field,
  FormSection,
  PageHeader,
  controlClass,
} from "@/components/admin/ui";
import { apiFetch } from "@/lib/api-client";

type Profile = {
  id: string;
  fullName: string;
  email: string;
  mobile: string | null;
  roleName: string;
  status: "active" | "inactive";
  lastLoginAt: string | null;
  createdAt: string;
  admissionsCreated: number;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [detailsSaving, setDetailsSaving] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [detailsNotice, setDetailsNotice] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch("/api/admin/profile");
    if (res?.ok) {
      const data: Profile = await res.json();
      setProfile(data);
      setFullName(data.fullName);
      setMobile(data.mobile ?? "");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault();
    setDetailsError(null);
    setDetailsNotice(null);

    if (!fullName.trim()) {
      setDetailsError("Name cannot be empty.");
      return;
    }

    setDetailsSaving(true);
    const res = await apiFetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: fullName.trim(), mobile: mobile.trim() }),
    });
    setDetailsSaving(false);

    if (!res) return;
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setDetailsError(body.error || "Could not save your details");
      return;
    }

    setDetailsNotice("Details updated.");
    load();
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordNotice(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    setPasswordSaving(true);
    const res = await apiFetch("/api/admin/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setPasswordSaving(false);

    if (!res) return;
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setPasswordError(body.error || "Could not change your password");
      return;
    }

    setPasswordNotice("Password changed.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  if (loading) {
    return <p className="text-sm text-[#9CA3AF]">Loading…</p>;
  }

  if (!profile) {
    return (
      <Card className="flex items-center gap-2">
        <AlertCircle className="size-4 shrink-0 text-red-600" />
        <p className="text-sm text-red-700">Could not load your profile.</p>
      </Card>
    );
  }

  const initials = profile.fullName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-3xl">
      <PageHeader title="My Profile" subtitle="Your account details and password" />

      {/* Identity summary */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#013220] text-lg font-semibold text-[#C5A059]">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-[#1A1A1A]">{profile.fullName}</h2>
              <Badge tone={profile.roleName === "Super Admin" ? "gold" : "neutral"}>
                {profile.roleName}
              </Badge>
            </div>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#6B7280]">
              <Mail className="size-3.5" />
              {profile.email}
            </p>
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[#F0EDE7] pt-4 sm:grid-cols-4">
          <div>
            <dt className="flex items-center gap-1 text-[0.68rem] uppercase tracking-[0.08em] text-[#9CA3AF]">
              <FileText className="size-3" />
              Admissions Filled
            </dt>
            <dd className="mt-0.5 text-sm font-semibold text-[#1A1A1A]">
              {profile.admissionsCreated}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-[0.68rem] uppercase tracking-[0.08em] text-[#9CA3AF]">
              <Shield className="size-3" />
              Status
            </dt>
            <dd className="mt-0.5 text-sm font-semibold capitalize text-[#1A1A1A]">
              {profile.status}
            </dd>
          </div>
          <div>
            <dt className="text-[0.68rem] uppercase tracking-[0.08em] text-[#9CA3AF]">Last Login</dt>
            <dd className="mt-0.5 text-sm font-semibold text-[#1A1A1A]">
              {profile.lastLoginAt
                ? new Date(profile.lastLoginAt).toLocaleDateString("en-IN")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[0.68rem] uppercase tracking-[0.08em] text-[#9CA3AF]">Member Since</dt>
            <dd className="mt-0.5 text-sm font-semibold text-[#1A1A1A]">
              {new Date(profile.createdAt).toLocaleDateString("en-IN")}
            </dd>
          </div>
        </dl>
      </Card>

      {/* Editable details */}
      <Card className="mb-5">
        <form onSubmit={handleSaveDetails}>
          <FormSection title="Account Details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full Name" required>
                <input
                  className={controlClass}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Field>
              <Field label="Mobile">
                <input
                  className={controlClass}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                />
              </Field>
              <Field label="Email" hint="Contact a Super Admin to change your email">
                <input className={controlClass} value={profile.email} disabled />
              </Field>
              <Field label="Role" hint="Only a Super Admin can change roles">
                <input className={controlClass} value={profile.roleName} disabled />
              </Field>
            </div>

            {detailsError && (
              <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="size-4 shrink-0" />
                {detailsError}
              </p>
            )}
            {detailsNotice && (
              <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                <CheckCircle2 className="size-4 shrink-0" />
                {detailsNotice}
              </p>
            )}

            <div className="mt-5">
              <button
                type="submit"
                disabled={detailsSaving}
                className="inline-flex h-9 items-center rounded-lg bg-[#1A1A1A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#013220] disabled:opacity-60"
              >
                {detailsSaving ? "Saving…" : "Save Details"}
              </button>
            </div>
          </FormSection>
        </form>
      </Card>

      {/* Password */}
      <Card>
        <form onSubmit={handleChangePassword}>
          <FormSection title="Change Password">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Current Password" required>
                <input
                  className={controlClass}
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </Field>
              <Field label="New Password" required hint="Minimum 8 characters">
                <input
                  className={controlClass}
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Field>
              <Field label="Confirm New Password" required>
                <input
                  className={controlClass}
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>
            </div>

            {passwordError && (
              <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                <AlertCircle className="size-4 shrink-0" />
                {passwordError}
              </p>
            )}
            {passwordNotice && (
              <p className="mt-4 flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
                <CheckCircle2 className="size-4 shrink-0" />
                {passwordNotice}
              </p>
            )}

            <div className="mt-5">
              <button
                type="submit"
                disabled={passwordSaving || !currentPassword || !newPassword}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#1A1A1A] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#013220] disabled:opacity-60"
              >
                <KeyRound className="size-4" />
                {passwordSaving ? "Updating…" : "Change Password"}
              </button>
            </div>
          </FormSection>
        </form>
      </Card>
    </div>
  );
}
