"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface FormData {
  venueId: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  notes: string;
}

export default function AddMaintenanceForm({
  venues,
}: {
  venues: { id: string; name: string }[];
}) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await fetch("/api/venue/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSuccess(true);
      reset();
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="form-label">Venue *</label>
        <select {...register("venueId", { required: true })} className="form-input text-sm">
          <option value="">Select Venue</option>
          {venues.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="form-label">Title *</label>
        <input {...register("title", { required: true })} className="form-input text-sm" placeholder="e.g. Annual Turf Check" />
      </div>
      <div>
        <label className="form-label">Type *</label>
        <select {...register("type", { required: true })} className="form-input text-sm">
          <option value="">Select Type</option>
          <option value="ROUTINE">Routine</option>
          <option value="REPAIR">Repair</option>
          <option value="RENOVATION">Renovation</option>
          <option value="INSPECTION">Inspection</option>
          <option value="EMERGENCY">Emergency</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="form-label">Start Date *</label>
          <input {...register("startDate", { required: true })} type="date" className="form-input text-sm" />
        </div>
        <div>
          <label className="form-label">End Date *</label>
          <input {...register("endDate", { required: true })} type="date" className="form-input text-sm" />
        </div>
      </div>
      <div>
        <label className="form-label">Notes</label>
        <textarea {...register("notes")} rows={2} className="form-input text-sm" placeholder="Optional details..." />
      </div>

      <button type="submit" disabled={loading} className="btn-success w-full justify-center py-2.5 text-sm">
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
        ) : success ? (
          <><CheckCircle className="w-4 h-4" /> Scheduled!</>
        ) : (
          "Schedule Maintenance"
        )}
      </button>
    </form>
  );
}
