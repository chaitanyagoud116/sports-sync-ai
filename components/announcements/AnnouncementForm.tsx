"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AnnouncementFormProps {
  defaultScope?: "STATE" | "DISTRICT" | "SPORT";
  defaultScopeValue?: string;
  lockScope?: boolean;
}

export default function AnnouncementForm({
  defaultScope = "DISTRICT",
  defaultScopeValue = "",
  lockScope = false,
}: AnnouncementFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [scope, setScope] = useState(defaultScope);
  const [scopeValue, setScopeValue] = useState(defaultScopeValue);
  const [priority, setPriority] = useState("NORMAL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          scope,
          scopeValue: scopeValue || undefined,
          priority,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || "Failed to post announcement");
        return;
      }
      setTitle("");
      setMessage("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass-card p-6 space-y-4">
      <h2 className="text-lg font-semibold text-primary">Broadcast Announcement</h2>
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          {error}
        </p>
      )}
      <div>
        <label className="form-label">Title</label>
        <input
          className="form-input w-full"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={3}
        />
      </div>
      <div>
        <label className="form-label">Message</label>
        <textarea
          className="form-input w-full min-h-[100px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          minLength={5}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="form-label">Scope</label>
          <select
            className="form-input w-full"
            value={scope}
            onChange={(e) => setScope(e.target.value as typeof scope)}
            disabled={lockScope}
          >
            <option value="STATE">State-wide</option>
            <option value="DISTRICT">District</option>
            <option value="SPORT">Sport</option>
          </select>
        </div>
        <div>
          <label className="form-label">Scope value</label>
          <input
            className="form-input w-full"
            value={scopeValue}
            onChange={(e) => setScopeValue(e.target.value)}
            placeholder="e.g. NORTH_GOA or FOOTBALL"
            disabled={lockScope && !!defaultScopeValue}
          />
        </div>
        <div>
          <label className="form-label">Priority</label>
          <select
            className="form-input w-full"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="LOW">Low</option>
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
      </div>
      <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Publish
      </button>
    </form>
  );
}
