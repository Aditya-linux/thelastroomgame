"use client";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

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

  const upiId = "adityanishad0402-1@okaxis";
  const merchantName = "TheLastRoom";
  
  const handlePay = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    if (!session) {
      signIn("google", { callbackUrl: `/games?autoplay=${gameId}` });
      return;
    }

    const href = e.currentTarget.href;

    setLoading(true);
    try {
      // 1. If it's a paid game, attempt to open the UPI link
      // For mobile devices this will open the respective app.
      if (cost > 0 && href !== "#") {
        window.location.href = href;
        // give it a brief moment to trigger the app intent
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      // 2. Call the backend endpoint to request access
      const res = await fetch("/api/upi-request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });

      const data = await res.json();
      if (data.error && data.error !== "Already purchased") {
        throw new Error(data.error);
      }

      // 3. Redirect to the waitlist
      router.push(`/waitlist/${gameId}`);
    } catch (error) {
      console.error("Payment Flow Failed:", error);
      alert("Failed to unlock room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (cost === 0) {
    return (
      <button className="pay-btn" onClick={() => handlePay({ currentTarget: { href: "#" }, preventDefault: () => {} } as any)} disabled={loading}>
        {loading ? "PROCESSING..." : "ENTER FOR FREE"}
      </button>
    );
  }

  const baseUpiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${cost}&cu=INR`;

  return (
    <div className="upi-payment-options" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
      <p style={{ color: 'var(--muted)', fontSize: '0.8rem', textAlign: 'center', marginBottom: '5px' }}>
        SCAN QR OR CHOOSE APP TO PAY
      </p>

      {/* QR Code Section */}
      <div style={{ 
        background: '#111', 
        padding: '15px', 
        borderRadius: '8px', 
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <img 
          src="/qr-payment.png" 
          alt="Payment QR Code" 
          style={{ width: '180px', height: '180px', borderRadius: '4px' }}
        />
        <p style={{ color: 'var(--muted)', fontSize: '0.7rem', marginTop: '10px' }}>
          UPI ID: {upiId}
        </p>
        <div style={{ marginTop: '15px', color: '#fff', fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }}>
          <p style={{ color: '#FF2D6B', marginBottom: '8px' }}>PAY the fixed amount instructed</p>
          <p>Send your name with upi id with SS (Screenshot) for verification</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '10px', fontWeight: 'normal' }}>
            * After payment, fill the Google Form provided below
          </p>
        </div>
      </div>
      
      <a 
        href={baseUpiLink} 
        onClick={handlePay} 
        className="pay-btn" 
        style={{ textDecoration: 'none', textAlign: 'center', backgroundColor: '#fff', color: '#000' }}
      >
        {loading ? "PROCESSING..." : `PAY ₹${cost} WITH GPAY`}
      </a>

      <a 
        href={baseUpiLink} 
        onClick={handlePay} 
        className="pay-btn" 
        style={{ textDecoration: 'none', textAlign: 'center', backgroundColor: '#6739B7', color: '#fff' }}
      >
        {loading ? "PROCESSING..." : `PAY ₹${cost} WITH PHONEPE`}
      </a>

      <a 
        href={baseUpiLink} 
        onClick={handlePay} 
        className="pay-btn" 
        style={{ textDecoration: 'none', textAlign: 'center', backgroundColor: '#00BAF2', color: '#fff' }}
      >
        {loading ? "PROCESSING..." : `PAY ₹${cost} WITH PAYTM`}
      </a>
    </div>
  );
}
