"use client";

import { useState, Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Trophy, Eye, EyeOff, AlertCircle, Loader2, LogOut, Shield, ChevronLeft } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { getDashboardForRole } from "@/lib/auth-routes";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

const roles = [
  { value: "ATHLETE", label: "Athlete", icon: "🏃" },
  { value: "COACH", label: "Coach", icon: "👨‍🏫" },
  { value: "DISTRICT_OFFICER", label: "District Officer", icon: "📍" },
  { value: "ADMIN", label: "State Admin", icon: "🏛️" },
  { value: "GOV_ADMIN", label: "Govt Admin", icon: "🛡️" },
  { value: "VENUE_MANAGER", label: "Venue Manager", icon: "🏟️" },
] as const;

type RoleValue = (typeof roles)[number]["value"];

const demoCredentials: Record<RoleValue, { email: string; password: string }> = {
  ATHLETE: { email: "athlete@sportssync.goa.in", password: "Athlete@123" },
  COACH: { email: "coach1@sportssync.goa.in", password: "Coach@123" },
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
    await signOut({ callbackUrl: "/login" });
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
        setAuthError("Authentication failed. Please verify your credentials and role selection.");
        return;
      }

      window.location.href = getDashboardForRole(role);
    } catch {
      setAuthError("A system error occurred. Please contact the technical desk.");
    } finally {
      setLoading(false);
    }
  };

  const activeRole = roles.find((r) => r.value === selectedRole) ?? roles[0];
  const wrongPortalSession = status === "authenticated" && sessionRole && sessionRole !== selectedRole;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Seal Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
         <img src="/emblem.svg" alt="Goa Seal" className="w-[800px] h-[800px]" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-surface-500 hover:text-primary font-bold text-xs uppercase tracking-widest mb-8 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Public Portal
          </Link>
          
          <div className="w-20 h-20 rounded-full bg-white border-4 border-primary p-3 shadow-xl mx-auto mb-6">
             <img src="/emblem.svg" alt="Goa Seal" className="w-full h-full" />
          </div>
          
          <h1 className="text-4xl font-serif font-black text-primary leading-tight">Official Secure Access</h1>
          <p className="text-surface-600 font-medium mt-3">Sports Sync AI · Unified Government Ecosystem</p>
        </motion.div>

        {status === "authenticated" && sessionRole && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mb-8 p-6 rounded-lg border-2 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm ${
              wrongPortalSession 
                ? "bg-secondary/5 border-secondary/20 text-secondary" 
                : "bg-primary/5 border-primary/20 text-primary"
            }`}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wide">
                {wrongPortalSession
                  ? `Active Session: ${sessionRole.replace(/_/g, " ")} — Unauthorized for this Portal`
                  : `Authenticated as ${sessionRole.replace(/_/g, " ")}`}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {!wrongPortalSession && (
                <Link href={getDashboardForRole(sessionRole)}>
                  <Button size="sm" className="bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest px-4">
                    Open Dashboard
                  </Button>
                </Link>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="text-[10px] font-black uppercase tracking-widest px-4 border-surface-300"
              >
                <LogOut className="w-3 h-3 mr-2" /> Sign Out
              </Button>
            </div>
          </motion.div>
        )}

        <div className="card-heritage p-0 overflow-hidden bg-white shadow-premium-lg">
          <div className="bg-primary/5 border-b border-surface-100 p-8">
            <h2 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
               <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">1</span>
               Identify Official Capacity
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  aria-label={`Select ${r.label} role`}
                  onClick={() => handleRoleChange(r.value)}
                  className={`flex items-center gap-3 p-4 rounded-md border-2 transition-all text-left ${
                    selectedRole === r.value 
                      ? "bg-white border-primary shadow-md" 
                      : "bg-surface-50 border-surface-200 grayscale opacity-70 hover:opacity-100 hover:border-primary/30"
                  }`}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <span className={`text-[11px] font-black uppercase tracking-tight leading-tight ${selectedRole === r.value ? "text-primary" : "text-surface-500"}`}>
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-8">
            <h2 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] mb-2 flex items-center gap-2">
               <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">2</span>
               Credential Verification
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Email Address</label>
                <input 
                  {...register("email")} 
                  type="email" 
                  className="w-full px-4 py-3 rounded-md bg-surface-50 border border-surface-200 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-sm" 
                  autoComplete="email" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest">Security Password</label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 rounded-md bg-surface-50 border border-surface-200 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium text-sm"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {authError && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-4 rounded-md text-xs font-bold text-secondary bg-secondary/5 border border-secondary/20"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {authError}
              </motion.div>
            )}

            <div className="pt-4 flex flex-col gap-6">
              <Button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-14 text-md"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" /> 
                    Verifying Official Credentials...
                  </div>
                ) : (
                  `Authenticate into ${activeRole.label} Portal`
                )}
              </Button>
              
              <div className="text-center text-[10px] font-bold text-surface-400 uppercase tracking-[0.2em] px-10 leading-relaxed">
                By signing in, you acknowledge that this is an official government system. 
                Unauthorized access or misuse is subject to administrative and legal action.
              </div>
            </div>
          </form>
        </div>

        <div className="mt-12 text-center">
           <p className="text-xs font-bold text-surface-500 uppercase tracking-widest">
              Don't have an official ID? 
              <Link href="/register" className="ml-2 text-secondary hover:underline underline-offset-4">
                 Register New Profile
              </Link>
           </p>
        </div>
      </div>

      <footer className="mt-auto py-10 text-[10px] font-black uppercase tracking-[0.4em] text-surface-300">
         © 2026 Government of Goa · Department of Sports and Youth Affairs
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
