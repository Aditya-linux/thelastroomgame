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
  
  const handlePay = async (e?: React.MouseEvent | React.FormEvent) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    setLoading(true);
    if (!session) {
      signIn("google", { callbackUrl: `/games?autoplay=${gameId}` });
      setLoading(false); // Reset loading if redirecting for sign-in
      return;
    }


    setLoading(true);
    try {
      const res = await fetch("/api/upi-request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/waitlist/${gameId}`);
      } else if (data.error && data.error !== "Already purchased") {
        throw new Error(data.error);
      } else if (data.error === "Already purchased") {
        router.push(`/waitlist/${gameId}`); // Redirect even if already purchased
      }
    } catch (err) {
      console.error("Payment Flow Failed:", err);
      alert("Failed to unlock room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formUrl = "https://forms.gle/RYTt6ZJ87h38kobo8";

  if (cost === 0) {
    return (
      <button className="pay-btn" onClick={() => handlePay()} disabled={loading}>
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
          src="/QR.jpeg" 
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
        <a 
          href={formUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="pay-btn" 
          style={{ textDecoration: 'none', textAlign: 'center', backgroundColor: '#fff', color: '#000', fontWeight: 'bold' }}
        >
          STEP 1: FILL VERIFICATION FORM
        </a>

        <button 
          onClick={() => handlePay()} 
          className="pay-btn" 
          disabled={loading}
          style={{ 
            textAlign: 'center', 
            backgroundColor: '#FF2D6B', 
            color: '#fff', 
            fontWeight: 'bold',
            border: 'none',
            cursor: loading ? 'wait' : 'pointer'
          }}
        >
          {loading ? "REGISTERING..." : "STEP 2: I HAVE PAID & SUBMITTED"}
        </button>
      </div>
    </div>
  );
}
