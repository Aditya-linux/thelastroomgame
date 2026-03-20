"use client";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

export function PayButton({
  gameId,
  cost,
}: {
  gameId: string;
  cost: number;
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!session) {
      signIn("google", { callbackUrl: `/games?autoplay=${gameId}` });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });

      const data = await res.json();

      if (data.alreadyPaid) {
        window.location.href = `/room/${gameId}`;
        return;
      }

      window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  };

  return (
    <button className="pay-button" onClick={handlePay} disabled={loading}>
      <span className="pay-button-icon">⎡</span>
      <span className="pay-button-text">
        {loading ? "PROCESSING..." : `ENTER FOR $${cost}`}
      </span>
      <span className="pay-button-icon">⎤</span>
    </button>
  );
}
