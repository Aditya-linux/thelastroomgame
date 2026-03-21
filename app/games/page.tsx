"use client";
import { useState, useEffect } from "react";
import { GameTier, GAME_TIERS } from "@/lib/games";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, setDoc, doc } from "firebase/firestore";
import { PayButton } from "@/components/PayButton";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function GamesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [games, setGames] = useState<GameTier[]>([]);
  const [chosen, setChosen] = useState<GameTier | null>(null);
  const [screen, setScreen] = useState<"select" | "payment">("select");
  const [mounted, setMounted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingFree, setLoadingFree] = useState(false);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    if (params.get("msg") === "login_required") {
      setErrorMsg("ACCESS DENIED: Please sign in to enter a room.");
    } else if (params.get("unpaid") === "true") {
      setErrorMsg("ACCESS DENIED: Entry fee required. Please select a tier and complete payment.");
    }

    const fetchGames = async () => {
      try {
        const snap = await getDocs(query(collection(db, "games")));
        const dbMap = new Map();
        snap.forEach(d => dbMap.set(d.id, d.data()));

        const mergedGames = GAME_TIERS.map(baseTier => {
          const liveData = dbMap.get(baseTier.id);
          
          if (!liveData) {
            // Auto-heal backend database silently if empty
            setDoc(doc(db, "games", baseTier.id), { ...baseTier, status: "active" }).catch(() => {});
          }
          
          return { ...baseTier, ...liveData, status: "active" } as GameTier;
        });

        // Ensure sorted by cost
        mergedGames.sort((a, b) => a.cost - b.cost);
        setGames(mergedGames);
      } catch (err) {
        console.error("Error fetching games", err);
      }
    };
    fetchGames();
  }, []);

  if (!mounted) return null;


  if (screen === "payment" && chosen) {
    const prize = Math.floor(chosen.cost * 200 * chosen.winPercent / 100);

    return (
      <div className="payment-screen">
        <p className="select-eyebrow" style={{ letterSpacing: "0.5em", color: "var(--muted)" }}>CONFIRM ENTRY</p>

        <div className="payment-card">
          <div className="payment-card-header">
            <span className="payment-suit" style={{ color: chosen.color, filter: `drop-shadow(0 0 8px ${chosen.color})` }}>{chosen.suit}</span>
            <div>
              <div className="payment-title">{chosen.suitName} GAME</div>
              <div className="payment-subtitle">{chosen.shape} {chosen.shapeLabel} · DIFFICULTY {chosen.difficulty}</div>
            </div>
          </div>
          <div className="payment-rows">
            <div className="payment-row">
              <span className="payment-row-label">Entry Fee</span>
              <span className="payment-row-val accent">${chosen.cost}</span>
            </div>
            <div className="payment-row">
              <span className="payment-row-label">Prize if you win</span>
              <span className="payment-row-val" style={{ color: chosen.color }}>${prize}+</span>
            </div>
            <div className="payment-row">
              <span className="payment-row-label">Winner share</span>
              <span className="payment-row-val">{chosen.winPercent}% of total pool</span>
            </div>
            <div className="payment-row">
              <span className="payment-row-label">Refund policy</span>
              <span className="payment-row-val" style={{ color: "var(--muted)", fontSize: 11 }}>None after door opens</span>
            </div>
          </div>
          <PayButton gameId={chosen.id} cost={chosen.cost} />
        </div>

        <button className="back-ghost" onClick={() => setScreen("select")}>← BACK TO GAMES</button>
        <p className="legal-note">
          This is a skill contest. No purchase necessary — mail-in entry available per T&C.
          Entry fees fund the prize pool. You keep 30% as operator. Winner verified by solve path.
        </p>
      </div>
    );
  }

  // Map dummy player counts for visual effect
  const players: Record<string, number> = { hearts: 894, clubs: 312, diamonds: 147, spades: 38 };

  const handleProceed = async () => {
    if (!chosen) return;
    
    if (chosen.cost === 0) {
      if (!session) {
        window.location.href = `/api/auth/signin?callbackUrl=/games`;
        return;
      }
      setLoadingFree(true);
      try {
        const res = await fetch("/api/free-entry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: chosen.id })
        });
        if (res.ok) {
          router.push(`/room/${chosen.id}`);
        } else {
          const data = await res.json();
          setErrorMsg(data.error || "Failed to enter room");
          setLoadingFree(false);
        }
      } catch (err: any) {
        setErrorMsg(err.message);
        setLoadingFree(false);
      }
    } else {
      setScreen("payment");
    }
  };

  return (
    <div className="game-select">
      <Link href="/" className="back-ghost" style={{ position: 'absolute', top: 40, left: 40, margin: 0, textDecoration: 'none' }}>
        ← LOBBY
      </Link>
      
      <div className="select-header">
        <p className="select-eyebrow">Choose Your Game</p>
        <h2 className="select-title">Which suit do you play?</h2>
        <p className="select-sub">Higher difficulty · Smaller cap · Larger prize share</p>
      </div>

      {errorMsg && (
        <div style={{ background: "rgba(255,45,107,0.1)", border: "1px solid var(--pink)", color: "var(--white)", padding: "12px 24px", marginBottom: "32px", fontSize: "12px", letterSpacing: "0.2em", width: "100%", maxWidth: "900px", textAlign: "center" }}>
          ⚠ {errorMsg}
        </div>
      )}

      <div className="cards-row">
        {games.map(g => (
          <div
            key={g.id}
            className={`game-card ${chosen?.id === g.id ? "chosen" : ""}`}
            style={{ "--card-color": g.color } as React.CSSProperties}
            onClick={() => setChosen(g)}
          >
            <div className="card-top-bar" />
            <div className="card-body">
              <div className="card-suit-row">
                <span className="card-suit-symbol">{g.suit}</span>
                <div style={{ textAlign: "right" }}>
                  <div className="card-difficulty">{g.difficulty}</div>
                  <div className="card-shape-badge">{g.shape} {g.shapeLabel}</div>
                </div>
              </div>
              <div className="card-category">{g.category} GAME</div>
              <div className="card-name">{g.name}</div>
              <div className="card-desc">{g.description}</div>
              <div className="card-stats">
                <div className="card-stat">
                  <span className="card-stat-val">${g.cost}</span>
                  <span className="card-stat-lbl">Entry</span>
                </div>
                <div className="card-stat">
                  <span className="card-stat-val">{g.cap}</span>
                  <span className="card-stat-lbl">Cap</span>
                </div>
                <div className="card-stat">
                  <span className="card-stat-val">{g.winPercent}%</span>
                  <span className="card-stat-lbl">Winner</span>
                </div>
              </div>
            </div>
            <div className="card-players">
              <span className="pulse-dot" style={{ background: g.color, boxShadow: `0 0 8px ${g.color}` }} />
              {players[g.id] || 0} entered · {g.cap - (players[g.id] || 0)} slots left
            </div>
          </div>
        ))}
      </div>

      <button
        className="proceed-btn"
        disabled={!chosen || loadingFree}
        onClick={handleProceed}
      >
        {chosen 
          ? loadingFree ? "PROVISIONING ACCESS..." : (chosen.cost === 0 ? `ENTER ${chosen.suitName} ${chosen.suit} — FREE` : `ENTER ${chosen.suitName} ${chosen.suit} — $${chosen.cost}`) 
          : "SELECT A GAME"}
      </button>
    </div>
  );
}
