"use client";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

export function PayButton({
  gameId,
}: {
  gameId: string;
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const upiId = "adityanishad0402-1@okaxis";

  const handleContinue = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    if (!session) {
      signIn("google", { callbackUrl: `/games?autoplay=${gameId}` });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/free-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId })
      });
      const data = await res.json();
      if (data.success || data.error === "Already purchased") {
        window.location.href = `/room/${gameId}`;
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error("Access Flow Failed:", err);
      alert("Failed to initialize room access. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-dev-options" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
      <div style={{ background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid var(--pink)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <p style={{ color: 'var(--white)', fontSize: '1rem', textAlign: 'center', marginBottom: '10px', fontWeight: 'bold', letterSpacing: '0.1em' }}>
          SUPPORT THE DEVELOPER
        </p>
        <p style={{ color: 'var(--muted)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '15px', lineHeight: '1.4' }}>
          This room is completely free to play.<br/>If you enjoy the puzzles, consider supporting to help me build more!
        </p>
        
        <img src="/QR.jpeg" alt="Donate QR Code" style={{ width: '160px', height: '160px', borderRadius: '4px', border: '2px solid var(--pink)' }} />
        <p style={{ color: 'var(--muted)', fontSize: '0.75rem', marginTop: '10px', fontFamily: 'monospace' }}>UPI ID: {upiId}</p>
        
        <a 
          href="https://x.com/thelastroomgame" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ marginTop: '15px', padding: '8px 20px', backgroundColor: '#000', color: '#fff', border: '1px solid #333', borderRadius: '20px', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}
        >
          𝕏 Follow for Updates
        </a>
      </div>

      <button 
        onClick={handleContinue} 
        disabled={loading}
        style={{ 
          textAlign: 'center', 
          backgroundColor: '#00f5c4', 
          color: '#000', 
          fontWeight: 'bold',
          border: 'none',
          padding: '14px',
          borderRadius: '4px',
          cursor: loading ? 'wait' : 'pointer',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.1em',
          transition: '0.2s',
          textTransform: 'uppercase'
        }}
      >
        {loading ? "INITIALIZING LINK..." : "CONTINUE TO GAME ➔"}
      </button>
    </div>
  );
}
