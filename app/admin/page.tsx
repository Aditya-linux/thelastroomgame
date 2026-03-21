"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, query, where } from "firebase/firestore";
import { GAME_TIERS, ANSWER_HASHES } from "@/lib/games";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeGames, setActiveGames] = useState<any[]>([]);
  const [pendingEntries, setPendingEntries] = useState<any[]>([]);
  const [triggering, setTriggering] = useState<string | null>(null);

  // Simple admin check: restrict to a specific email for MVP
  const isAdmin = session?.user?.email === "admin@thelastroom.com" || true; // Replace `true` with your admin's email or logic.

  useEffect(() => {
    fetchActiveGames();
    fetchPendingEntries();
  }, []);

  const fetchActiveGames = async () => {
    const querySnapshot = await getDocs(collection(db, "games"));
    setActiveGames(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const fetchPendingEntries = async () => {
    const q = query(collection(db, "entries"), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    setPendingEntries(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const approveEntry = async (entryId: string) => {
    try {
      await fetch("/api/admin/approve-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId })
      });
      fetchPendingEntries();
    } catch (e: any) {
      setMessage(`Error approving entry: ${e.message}`);
    }
  };

  const triggerHint = async (gameId: string) => {
    setTriggering(gameId);
    try {
      await fetch("/api/admin/trigger-hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId })
      });
      setMessage(`Hint broadcasted in ${gameId}`);
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    }
    setTriggering(null);
  };

  const initializeDefaultGames = async () => {
    setLoading(true);
    try {
      for (const game of GAME_TIERS) {
        await setDoc(doc(db, "games", game.id), {
          ...game,
          answerHash: ANSWER_HASHES[game.id],
          status: "active",
          createdAt: new Date(),
          forceHints: 0
        });
      }
      setMessage("Default games initialized successfully!");
      fetchActiveGames();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  if (!isAdmin) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)', color: 'var(--white)' }}>
        <div style={{ textAlign: 'center', padding: '2rem', border: '1px solid var(--pink-border)', background: 'var(--pink-dim)' }}>
          <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-mono)', color: 'var(--pink)' }}>ACCESS DENIED</h1>
          <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--muted)' }}>You do not have operator privileges for the arena.</p>
        </div>
      </div>
    );
  }

  const containerStyle = { minHeight: '100vh', background: 'var(--bg)', color: 'var(--teal)', fontFamily: 'var(--font-mono)', padding: '2rem' };
  const headerStyle = { fontSize: '1.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--teal)', paddingBottom: '0.5rem', letterSpacing: '0.1em' };
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' };
  const panelStyle = { border: '1px solid var(--teal)', padding: '1.5rem', background: 'var(--teal-dim)' };
  const panelTitleStyle = { fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--teal)', letterSpacing: '0.1em' };
  const cardStyle = { border: '1px solid rgba(0, 245, 196, 0.3)', padding: '1rem', marginBottom: '1rem', background: '#0a0a14' };
  const flexBetween = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const btnStyle = { padding: '8px 16px', background: 'rgba(0, 245, 196, 0.2)', border: '1px solid var(--teal)', color: 'var(--teal)', cursor: 'pointer', fontFamily: 'var(--font-mono)', transition: '0.2s' };
  const btnDangerStyle = { ...btnStyle, background: 'rgba(255, 45, 107, 0.2)', borderColor: 'var(--pink)', color: 'var(--pink)' };

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>OPERATOR VIEW: THE LAST ROOM</h1>
      
      <div style={gridStyle}>
        {/* Active Lobbies */}
        <div style={panelStyle}>
          <h2 style={panelTitleStyle}>ACTIVE LOBBIES</h2>
          <div>
            {activeGames.map((game, i) => (
              <div key={i} style={cardStyle}>
                <div style={flexBetween}>
                  <h3 style={{ fontSize: '1.125rem', color: 'var(--white)' }}>{game.name} ({game.id})</h3>
                  <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'var(--teal-dim)', color: 'var(--teal)' }}>
                    {game.status ? game.status.toUpperCase() : 'UNKNOWN'}
                  </span>
                </div>
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--muted)' }}>
                  <p>Difficulty: {game.difficulty}</p>
                  <p>Cost: ₹{game.cost}</p>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => triggerHint(game.id)}
                    disabled={triggering === game.id}
                    style={{...btnStyle, opacity: triggering === game.id ? 0.5 : 1}}
                  >
                    {triggering === game.id ? "TRANSMITTING..." : "TRIGGER HINT TO ALL"}
                  </button>
                </div>
              </div>
            ))}
            {activeGames.length === 0 && (
              <p style={{ color: 'var(--muted)' }}>No active lobbies found.</p>
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div style={{ ...panelStyle, border: '1px solid var(--pink)', background: 'var(--pink-dim)' }}>
          <h2 style={{ ...panelTitleStyle, color: 'var(--pink)' }}>PENDING ENTRY REQUESTS</h2>
          <div>
            {pendingEntries.map((entry, i) => (
              <div key={i} style={{ ...cardStyle, border: '1px solid rgba(255, 45, 107, 0.3)' }}>
                <div style={flexBetween}>
                  <h3 style={{ fontSize: '1.125rem', color: 'var(--white)' }}>Player {entry.userId.slice(0,3).toUpperCase()}</h3>
                  <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'var(--yellow-dim)', color: 'var(--yellow)' }}>
                    PENDING: {entry.gameId.toUpperCase()}
                  </span>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => approveEntry(entry.id)}
                    style={{...btnDangerStyle}}
                  >
                    SELECT TO GRANT ACCESS
                  </button>
                </div>
              </div>
            ))}
            {pendingEntries.length === 0 && (
              <p style={{ color: 'var(--muted)' }}>No pending verification requests.</p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'grid', gap: '2rem' }}>
          <div style={panelStyle}>
            <h2 style={panelTitleStyle}>SYSTEM CONTROLS</h2>
            <button 
              onClick={initializeDefaultGames}
              disabled={loading}
              style={{ ...btnStyle, width: '100%', textAlign: 'left', opacity: loading ? 0.5 : 1 }}
            >
              {loading ? "INITIALIZING..." : "> INITIALIZE DEFAULT GAMES (GAME_TIERS)"}
            </button>
            {message && <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--yellow)' }}>{message}</p>}
          </div>

          {/* Revenue */}
          <div style={panelStyle}>
            <h2 style={panelTitleStyle}>REVENUE (ESTIMATED)</h2>
            <p style={{ fontSize: '2rem', color: 'var(--white)', fontFamily: 'var(--font-mono)' }}>₹{activeGames.reduce((acc, g) => acc + (g.prizePool || 0), 0).toFixed(2)}</p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--muted)' }}>Based on internal DB entries</p>
          </div>
        </div>
      </div>
    </div>
  );
}
