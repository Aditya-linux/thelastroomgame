"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function PayButton({
  gameId,
  cost,
}: {
  gameId: string;
  cost: number;
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePay = async () => {
    if (!session) {
      signIn("google", { callbackUrl: `/games?autoplay=${gameId}` });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });

      const orderData = await res.json();

      if (orderData.error) {
        if (orderData.error === "Already purchased") {
          router.push(`/room/${gameId}`);
          return;
        }
        throw new Error(orderData.error);
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "The Last Room",
        description: `Entry to ${gameId} room`,
        order_id: orderData.id,
        handler: async function (response: any) {
          // Success! Redirect to room
          router.push(`/room/${gameId}`);
        },
        prefill: {
          name: session.user?.name || "",
          email: session.user?.email || "",
        },
        theme: {
          color: "#FF2D6B",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
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
