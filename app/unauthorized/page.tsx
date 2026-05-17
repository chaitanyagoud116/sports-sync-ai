import Link from "next/link";
import { ShieldOff, LogOut } from "lucide-react";
import { PORTAL_LOGIN_LINKS } from "@/lib/auth-routes";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center hero-bg p-6">
      <div className="glass-card p-10 max-w-lg w-full text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(239,68,68,0.12)" }}
        >
          <ShieldOff className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-primary mb-2">Wrong portal</h1>
        <p className="text-sm text-slate-400 mb-8">
          You are signed in with a different role. Sign out and open the correct portal below.
        </p>

        <div className="grid gap-2 text-left mb-8">
          {PORTAL_LOGIN_LINKS.map((p) => (
            <Link
              key={p.role}
              href={p.href}
              className="block p-3 rounded-xl border border-surface-200 hover:border-surface-200 hover:bg-surface-50 border-surface-200 transition-all"
            >
              <span className="text-sm font-medium text-primary">{p.label}</span>
              <span className="block text-xs text-slate-500 mt-0.5">{p.description}</span>
            </Link>
          ))}
        </div>

        <Link
          href="/api/auth/signout?callbackUrl=/login"
          className="btn-secondary w-full justify-center inline-flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign out completely
        </Link>
      </div>
    </div>
  );
}
