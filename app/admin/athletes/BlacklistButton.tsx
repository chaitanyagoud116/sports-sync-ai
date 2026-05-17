"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BlacklistButton({
  athleteId,
  isBlacklisted,
  fullName,
}: {
  athleteId: string;
  isBlacklisted: boolean;
  fullName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    if (!confirm(`${isBlacklisted ? "Restore" : "Blacklist"} ${fullName}?`)) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/athletes/${athleteId}/blacklist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blacklist: !isBlacklisted }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={isBlacklisted ? "btn-success text-xs py-1.5" : "btn-danger text-xs py-1.5"}
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : isBlacklisted ? "Restore" : "Blacklist"}
    </button>
  );
}
