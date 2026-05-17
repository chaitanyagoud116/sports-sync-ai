"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, Trophy } from "lucide-react";
import { tournamentSchema, type TournamentInput } from "@/lib/validations";
import { SPORT_TYPES } from "@/lib/utils";

interface Venue {
  id: string;
  name: string;
  district: string;
}

export default function CreateTournamentForm({ venues }: { venues: Venue[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<TournamentInput>({
    resolver: zodResolver(tournamentSchema),
  });

  const onSubmit = async (data: TournamentInput) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/tournaments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      router.push("/admin/tournaments");
      router.refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {/* Tournament Name */}
        <div className="col-span-2">
          <label className="form-label">Tournament Name *</label>
          <input {...register("name")} className="form-input" placeholder="e.g. Goa State Football Championship 2025" />
          {errors.name && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.name.message}</p>}
        </div>

        {/* Sport */}
        <div>
          <label className="form-label">Sport *</label>
          <select {...register("sport")} className="form-input">
            <option value="">Select Sport</option>
            {SPORT_TYPES.map((s) => (
              <option key={s} value={s.toUpperCase().replace(/ /g, "_")}>{s}</option>
            ))}
          </select>
          {errors.sport && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.sport.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="form-label">Category *</label>
          <select {...register("category")} className="form-input">
            <option value="">Select Category</option>
            <option value="DISTRICT">District Level</option>
            <option value="STATE">State Level</option>
            <option value="NATIONAL">National</option>
            <option value="INTER_SCHOOL">Inter-School</option>
            <option value="INTER_COLLEGE">Inter-College</option>
            <option value="OPEN">Open</option>
          </select>
          {errors.category && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.category.message}</p>}
        </div>

        {/* Age Group */}
        <div>
          <label className="form-label">Age Group *</label>
          <select {...register("ageGroup")} className="form-input">
            <option value="">Select</option>
            <option value="Under 14">Under 14</option>
            <option value="Under 17">Under 17</option>
            <option value="Under 21">Under 21</option>
            <option value="Under 25">Under 25</option>
            <option value="Senior">Senior (Open)</option>
            <option value="Open">All Age Groups</option>
          </select>
          {errors.ageGroup && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.ageGroup.message}</p>}
        </div>

        {/* Max Participants */}
        <div>
          <label className="form-label">Max Participants *</label>
          <input {...register("maxParticipants", { valueAsNumber: true })}
            type="number" min={2} className="form-input" placeholder="e.g. 64" />
          {errors.maxParticipants && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.maxParticipants.message}</p>}
        </div>

        {/* Venue */}
        <div className="col-span-2">
          <label className="form-label">Venue *</label>
          <select {...register("venueId")} className="form-input">
            <option value="">Select Venue</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>{v.name} — {v.district.replace(/_/g, " ")}</option>
            ))}
          </select>
          {errors.venueId && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.venueId.message}</p>}
        </div>

        {/* Dates */}
        <div>
          <label className="form-label">Start Date *</label>
          <input {...register("startDate")} type="date" className="form-input" />
          {errors.startDate && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.startDate.message}</p>}
        </div>
        <div>
          <label className="form-label">End Date *</label>
          <input {...register("endDate")} type="date" className="form-input" />
          {errors.endDate && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.endDate.message}</p>}
        </div>

        {/* Required Documents */}
        <div className="col-span-2">
          <label className="form-label">Required Documents *</label>
          <input {...register("requiredDocuments")} className="form-input"
            placeholder="e.g. Aadhaar Card, Birth Certificate, Sports Certificate" />
          {errors.requiredDocuments && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.requiredDocuments.message}</p>}
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className="form-label">Description *</label>
          <textarea {...register("description")} rows={4} className="form-input"
            placeholder="Provide detailed information about the tournament, selection criteria, rules, etc." />
          {errors.description && <p className="form-error"><AlertCircle className="w-3 h-3" />{errors.description.message}</p>}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className="btn-secondary flex-1 justify-center py-3">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
          ) : (
            <><Trophy className="w-4 h-4" /> Create Tournament</>
          )}
        </button>
      </div>
    </form>
  );
}
