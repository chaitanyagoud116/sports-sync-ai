"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, AlertCircle, Loader2, CheckCircle, Upload } from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { DISTRICTS, SPORT_TYPES } from "@/lib/utils";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const nextStep = async () => {
    const fields: (keyof RegisterInput)[] =
      step === 1
        ? ["fullName", "email", "password", "phone"]
        : ["dob", "gender", "district", "address"];
    const valid = await trigger(fields);
    if (valid) setStep(step + 1);
  };

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Registration failed");
      setSuccess(true);
      setTimeout(() => router.push("/login?role=ATHLETE"), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center hero-bg">
        <div className="glass-card p-10 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(16,185,129,0.15)" }}>
            <CheckCircle className="w-8 h-8 text-emerald-700" />
          </div>
          <h2 className="text-xl font-bold text-primary mb-2">Registration Successful!</h2>
          <p style={{ color: "#94a3b8" }} className="text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 hero-bg">
      <div className="fixed inset-0 opacity-5" style={{
        backgroundImage: `linear-gradient(rgba(59,130,246,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.4) 1px, transparent 1px)`,
        backgroundSize: "60px 60px", pointerEvents: "none",
      }} />

      <div className="w-full max-w-lg relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}>
              <Trophy className="w-6 h-6 text-primary" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-primary mt-4">Create Athlete Account</h1>
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>Join the Goa Sports ecosystem</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-6 px-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{
                  background: step >= s ? "linear-gradient(135deg,#2563eb,#1d4ed8)" : "rgba(255,255,255,0.05)",
                  color: step >= s ? "white" : "#475569",
                  border: step === s ? "2px solid #3b82f6" : "2px solid transparent",
                }}>
                {step > s ? <CheckCircle className="w-4 h-4" /> : s}
              </div>
              <div className="text-xs" style={{ color: step >= s ? "#94a3b8" : "#475569" }}>
                {s === 1 ? "Account" : s === 2 ? "Profile" : "Sports Info"}
              </div>
              {s < 3 && <div className="flex-1 h-px" style={{ background: step > s ? "#2563eb" : "rgba(255,255,255,0.08)" }} />}
            </div>
          ))}
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Step 1: Account Info */}
            {step === 1 && (
              <div className="space-y-4 animate-fade">
                <h3 className="font-semibold text-primary text-sm mb-4">Account Information</h3>
                <div>
                  <label className="form-label">Full Name *</label>
                  <input {...register("fullName")} className="form-input" placeholder="As per government ID" />
                  {errors.fullName && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="form-label">Email Address *</label>
                  <input {...register("email")} type="email" className="form-input" placeholder="your@email.com" />
                  {errors.email && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.email.message}</p>}
                </div>
                <div>
                  <label className="form-label">Password *</label>
                  <input {...register("password")} type="password" className="form-input" placeholder="Min. 8 characters" />
                  {errors.password && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.password.message}</p>}
                </div>
                <div>
                  <label className="form-label">Mobile Number *</label>
                  <input {...register("phone")} className="form-input" placeholder="10-digit mobile number" />
                  {errors.phone && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.phone.message}</p>}
                </div>
                <button type="button" onClick={nextStep} className="btn-primary w-full justify-center py-3">
                  Continue →
                </button>
              </div>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <div className="space-y-4 animate-fade">
                <h3 className="font-semibold text-primary text-sm mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Date of Birth *</label>
                    <input {...register("dob")} type="date" className="form-input" />
                    {errors.dob && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.dob.message}</p>}
                  </div>
                  <div>
                    <label className="form-label">Gender *</label>
                    <select {...register("gender")} className="form-input">
                      <option value="">Select...</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                    {errors.gender && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.gender.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="form-label">District *</label>
                  <select {...register("district")} className="form-input">
                    <option value="">Select District</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d.toUpperCase().replace(/ /g, "_")}>{d}</option>
                    ))}
                  </select>
                  {errors.district && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.district.message}</p>}
                </div>
                <div>
                  <label className="form-label">Address *</label>
                  <textarea {...register("address")} className="form-input" rows={2} placeholder="Full residential address" />
                  {errors.address && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.address.message}</p>}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center py-3">
                    ← Back
                  </button>
                  <button type="button" onClick={nextStep} className="btn-primary flex-1 justify-center py-3">
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Sports Info */}
            {step === 3 && (
              <div className="space-y-4 animate-fade">
                <h3 className="font-semibold text-primary text-sm mb-4">Sports Information</h3>
                <div>
                  <label className="form-label">Sport Category *</label>
                  <select {...register("sport")} className="form-input">
                    <option value="">Select Sport</option>
                    {SPORT_TYPES.map((s) => (
                      <option key={s} value={s.toUpperCase().replace(/ /g, "_")}>{s}</option>
                    ))}
                  </select>
                  {errors.sport && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.sport.message}</p>}
                </div>
                <div>
                  <label className="form-label">Experience Level *</label>
                  <select {...register("experienceLevel")} className="form-input">
                    <option value="">Select Level</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                    <option value="PROFESSIONAL">Professional</option>
                  </select>
                  {errors.experienceLevel && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.experienceLevel.message}</p>}
                </div>
                <div>
                  <label className="form-label">Aadhaar Number <span style={{ color: "#475569" }}>(Optional)</span></label>
                  <input {...register("aadhaar")} className="form-input" placeholder="12-digit Aadhaar" maxLength={12} />
                </div>

                <div className="p-4 rounded-xl flex items-start gap-3" style={{
                  background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)"
                }}>
                  <Upload className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#60a5fa" }} />
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#60a5fa" }}>Document Upload</div>
                    <div className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                      You can upload certificates, Aadhaar, and photos after registration from your profile dashboard.
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg text-sm"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 justify-center py-3">
                    ← Back
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Account"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "#64748b" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#60a5fa" }} className="font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
