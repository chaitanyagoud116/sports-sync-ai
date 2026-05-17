"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BookingActionButton({
  bookingId,
  action,
}: {
  bookingId: string;
  action: "APPROVED" | "REJECTED";
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAction = async () => {
    setLoading(true);
    try {
      await fetch(`/api/venue/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAction}
      disabled={loading}
      className={action === "APPROVED" ? "btn-success text-xs" : "btn-danger text-xs"}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : action === "APPROVED" ? (
        <><CheckCircle className="w-3.5 h-3.5" /> Approve</>
      ) : (
        <><XCircle className="w-3.5 h-3.5" /> Reject</>
      )}
    </button>
  );
}
