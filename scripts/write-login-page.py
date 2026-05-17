# Writes app/login/page.tsx without typos
path = r"c:\Users\om\Desktop\sports-sync-ai\app\login\page.tsx"
content = r'''"use client";

import { useState, Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trophy, Eye, EyeOff, AlertCircle, Loader2, LogOut } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { getDashboardForRole } from "@/lib/auth-routes";

const roles = [
  { value: "ATHLETE", label: "Athlete", icon: "🏃", color: "#3b82f6" },
  { value: "COACH", label: "Coach", icon: "👨‍🏫", color: "#10b981" },
  { value: "DISTRICT_OFFICER", label: "District", icon: "📍", color: "#f59e0b" },
  { value: "ADMIN", label: "Admin", icon: "🏛️", color: "#8b5cf6" },
  { value: "GOV_ADMIN", label: "Govt.", icon: "🏛️", color: "#7c3aed" },
  { value: "VENUE_MANAGER", label: "Venue", icon: "🏟️", color: "#06b6d4" },
] as const;

type RoleValue = (typeof roles)[number]["value"];

const demoCredentials: Record<RoleValue, { email: string; password: string }> = {
  ATHLETE: { email: "athlete@sportssync.goa.in", password: "Athlete@123" },
  COACH: { email: "coach@sportssync.goa.in", password: "Coach@123" },
  DISTRICT_OFFICER: { email: "district@sportssync.goa.in", password: "District@123" },
  ADMIN: { email: "admin@sportssync.goa.in", password: "Admin@123" },
  GOV_ADMIN: { email: "gov@sportssync.goa.in", password: "Gov@123" },
  VENUE_MANAGER: { email: "venue@sportssync.goa.in", password: "Venue@123" },
};

function parseRole(param: string | null): RoleValue {
  const valid = roles.map((r) => r.value);
  if (param && valid.includes(param as RoleValue)) return param as RoleValue;
  return "ATHLETE";
}

function LoginForm() {
  const searchParams = useSearchParams();
  const roleFromUrl = parseRole(searchParams.get("role"));
  const shouldSwitch = searchParams.get("switch") === "1";

  const { data: session, status } = useSession();
  const sessionRole = session?.user?.role;

  const [selectedRole, setSelectedRole] = useState<RoleValue>(roleFromUrl);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, setValue, getValues } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { role: roleFromUrl, email: "", password: "" },
  });

  useEffect(() => {
    setSelectedRole(roleFromUrl);
    setValue("role", roleFromUrl);
    if (shouldSwitch && demoCredentials[roleFromUrl]) {
      setValue("email", demoCredentials[roleFromUrl].email);
      setValue("password", demoCredentials[roleFromUrl].password);
    }
  }, [roleFromUrl, shouldSwitch, setValue]);

  const handleRoleChange = (role: RoleValue) => {
    setSelectedRole(role);
    setValue("role", role);
    setAuthError("");
    const creds = demoCredentials[role];
    setValue("email", creds.email);
    setValue("password", creds.password);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.refresh();
  };

  const onSubmit = async () => {
    setLoading(true);
    setAuthError("");
    const role = selectedRole;
    const email = getValues("email");
    const password = getValues("password");

    try {
      if (session) await signOut({ redirect: false });

      const res = await signIn("credentials", {
        email,
        password,
        role,
        redirect: false,
      });

      if (res?.error || !res?.ok) {
        setAuthError(
          "Login failed. Use the correct role tab and demo credentials, or run: npm run auth:reset"
        );
        return;
      }

      window.location.href = getDashboardForRole(role);
    } catch {
      setAuthError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const activeRole = roles.find((r) => r.value === selectedRole) ?? roles[0];
  const wrongPortalSession =
    status === "authenticated" && sessionRole && sessionRole !== selectedRole;

  return (
    <motionLayout>
    <div className="min-h-screen flex items-center justify-center p-4 hero-bg">
      <div className="w-full max-w-lg relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-2">
            <motionLayout>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
            >
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-4">Portal Sign In</h1>
          <p className="text-sm mt-1 text-slate-500">
            Select your role, then sign in with the matching account
          </p>
        </div>

        {status === "authenticated" && sessionRole && (
          <div
            className="mb-4 p-4 rounded-xl text-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            style={{
              background: wrongPortalSession
                ? "rgba(251,191,36,0.1)"
                : "rgba(16,185,129,0.08)",
              border: `1px solid ${wrongPortalSession ? "rgba(251,191,36,0.25)" : "rgba(16,185,129,0.2)"}`,
            }}
          >
            <span style={{ color: wrongPortalSession ? "#fbbf24" : "#34d399" }}>
              {wrongPortalSession
                ? `Signed in as ${sessionRole.replace(/_/g, " ")} — sign out to switch portal`
                : `Signed in as ${sessionRole.replace(/_/g, " ")}`}
            </span>
            <div className="flex gap-2 shrink-0">
              {!wrongPortalSession && (
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = getDashboardForRole(sessionRole);
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300"
                >
                  Go to dashboard
                </button>
              )}
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 bg-white/5 text-slate-300"
              >
                <LogOut className="w-3 h-3" /> Sign out
              </button>
            </div>
          </div>
        )}

        <div className="glass-card p-8">
          <p className="form-label mb-3">1. Select portal</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => handleRoleChange(r.value)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all"
                style={{
                  background:
                    selectedRole === r.value ? `${r.color}20` : "rgba(255,255,255,0.03)",
                  borderColor:
                    selectedRole === r.value ? `${r.color}50` : "rgba(255,255,255,0.07)",
                  color: selectedRole === r.value ? r.color : "#64748b",
                }}
              >
                <span className="text-xl">{r.icon}</span>
                <span className="text-xs font-medium text-center">{r.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <p className="form-label">2. Enter credentials</p>
            <motionLayout>
            <div>
              <label className="form-label">Email</label>
              <input {...register("email")} type="email" className="form-input" autoComplete="email" />
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="form-input pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <motionLayout>
              <div className="flex items-center gap-2 p-3 rounded-lg text-sm text-red-400 bg-red-500/10 border border-red-500/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3"
              style={{
                background: `linear-gradient(135deg, ${activeRole.color}, ${activeRole.color}cc)`,
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Signing in...
                </>
              ) : (
                `Sign in to ${activeRole.label} Portal`
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6 text-slate-500">
          <Link href="/" className="text-blue-400 hover:underline">
            ← All portals
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
'''
import re
content = re.sub(r"</?motionLayout>\s*", "", content)
open(path, "w", encoding="utf-8").write(content)
print("written", path)
