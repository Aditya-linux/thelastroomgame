"use client";
import { useState, useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { doc, collection, query, where, onSnapshot } from "firebase/firestore";
import { GAME_TIERS } from "@/lib/games";

function useTimer(startHours = 47) {
  const [secs, setSecs] = useState(startHours * 3600 + 3 * 60 + 27);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return {
    h: Math.floor(secs / 3600),
    m: Math.floor((secs % 3600) / 60),
    s: secs % 60,
    total: secs,
    urgent: secs < 14400,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export function PuzzleRoom({ gameId, userId }: { gameId: string; userId: string }) {
  const [game, setGame] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<{ num: string; time: string; ts: number }[]>([]);
  const [liveStats, setLiveStats] = useState({ attempting: 0, players: 0 });

  const timer = useTimer(44);
  const playerNum = userId.slice(0, 3).toUpperCase() || "???";

  const [answer, setAnswer] = useState("");
  const [state, setState] = useState<"idle" | "correct" | "wrong">("idle");
  const [tries, setTries] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [hintCount, setHintCount] = useState(0);
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(false);

  const prevForceHints = useRef<number>(0);

  useEffect(() => {
    // 0. Request Notification permission
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }

    // 1. Live WebSockets for Game config (to detect forceHints)
    const unsubGame = onSnapshot(doc(db, "games", gameId), (d) => {
      if (d.exists()) {
        const data = d.data();
        setGame(data);

        const currentForceHints = data.forceHints || 0;
        if (currentForceHints > prevForceHints.current && prevForceHints.current !== 0) {
          // Trigger notification
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            new Notification("Intelligence Drop", {
              body: "A new hint has been forced open by the Operator.",
              icon: "/favicon.ico"
            });
          }
          // Increment hint count locally if available
          setHintCount(prev => prev < 2 ? prev + 1 : prev);
        }
        prevForceHints.current = currentForceHints;
      } else {
        // Fallback natively if no database entry exists
        const staticConfig = GAME_TIERS.find(t => t.id === gameId);
        if (staticConfig) {
          setGame(staticConfig);
        }
      }
    });

    // 2. Live WebSockets for Leaderboard and Stats
    const q = query(collection(db, "entries"), where("gameId", "==", gameId));
    const unsubEntries = onSnapshot(q, (snap) => {
      let attempting = 0;
      const lb: { num: string; time: string; ts: number }[] = [];

      snap.forEach((d) => {
        const data = d.data();
        if (data.solvedAt) {
          const paidAt = data.paidAt?.toMillis() || 0;
          const solvedAt = data.solvedAt.toMillis();
          const diffSecs = Math.floor((solvedAt - paidAt) / 1000);
          
          lb.push({
            num: data.userId.slice(0, 3).toUpperCase(),
            time: `${pad(Math.floor(diffSecs / 3600))}:${pad(Math.floor((diffSecs % 3600) / 60))}:${pad(diffSecs % 60)}`,
            ts: solvedAt,
          });
        } else if (data.attempts > 0) {
          attempting++;
        }
      });

      lb.sort((a, b) => a.ts - b.ts);
      setLeaderboard(lb);
      setLiveStats({ attempting, players: snap.size });
    });

    return () => {
      unsubGame();
      unsubEntries();
    };
  }, [gameId]); // Removed getDoc import from local scope dependency

  useEffect(() => {
    // Reveal native puzzle hints based on hintCount
    if (game?.puzzle) {
      const hints = [game.puzzle.hint1, game.puzzle.hint2];
      if (hintCount > 0 && hintCount <= hints.length) {
        setHint(hints[hintCount - 1]);
      }
    }
  }, [hintCount, game]);

  if (!game) return <div className="game-room" style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontFamily: "var(--font-mono)" }}>LOADING SECURE PROTOCOL...</div>;

  const elapsedHours = 44 - timer.h;
  const visibleClues = game.clues.filter((c: any) => c.hour <= elapsedHours + 1);
  const p = game.puzzle;

  const submit = async () => {
    if (!answer.trim() || solved || loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, answer: answer.trim().toUpperCase() }),
      });
      const data = await res.json();
      
      const t = tries + 1;
      setTries(t);

      if (data.correct) {
        setState("correct");
        setSolved(true);
        setTimeout(() => {
          // Pass stats via query string or rely on server state for win screen
          window.location.href = `/win?gameId=${gameId}&tries=${t}&h=${timer.h}&m=${timer.m}&s=${timer.s}`;
        }, 1200);
      } else {
        setState("wrong");
        setTimeout(() => setState("idle"), 900);
      }
    } catch {
      setState("wrong");
      setTimeout(() => setState("idle"), 900);
    } finally {
      setLoading(false);
    }
  };

  const revealHint = () => {
    if (hintCount < 2) {
      setHintCount((c) => c + 1);
    }
  };

  return (
    <div className="game-room" style={{ "--game-color": game.color } as React.CSSProperties}>
      {/* Topbar */}
      <div className="game-topbar">
        <div className="topbar-left">
          <span className="topbar-suit" style={{ color: game.color }}>{game.suit}</span>
          <span className="topbar-game-name">{game.suitName} GAME</span>
          <span className="topbar-sep">·</span>
          <span className="topbar-player">PLAYER {playerNum}</span>
        </div>
        <div className="topbar-right">
          <span className="live-badge"><span className="pulse-dot" style={{ width: 5, height: 5 }} />LIVE</span>
          <span className={`timer-display ${timer.urgent ? "warn" : ""}`}>
            {pad(timer.h)}:{pad(timer.m)}:{pad(timer.s)}
          </span>
        </div>
      </div>

      {/* Main puzzle area */}
      <div className="game-main">
        <div className="game-header">
          <p className="game-num-tag">{game.suit} {game.suitName} · {game.shape} {game.shapeLabel} · DIFFICULTY {game.difficulty}</p>
          <h2 className="game-main-title">{p.title}</h2>
        </div>

        <p className="game-flavor">{game.flavor}</p>

        <div className="rule-box">{p.body}</div>

        {/* GRID */}
        {p.type === "grid" && (
          <div className="grid-container">
            <p className="grid-sublabel">The Grid — something is hidden in plain sight</p>
            <div className="letter-grid">
              {p.grid.map((row: string[], ri: number) => (
                <div key={ri} className="grid-row">
                  {row.map((cell: string, ci: number) => (
                    <div key={ci} className={`grid-cell ${ci === 0 ? "hl" : ""}`}>{cell}</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CIPHER */}
        {p.type === "cipher" && (
          <div>
            <p className="grid-sublabel">Encoded Transmission</p>
            <div className="cipher-display">
              {p.encoded}
              <p className="cipher-note">{p.subtext}</p>
            </div>
          </div>
        )}

        {/* MULTI-STEP */}
        {p.type === "multi" && (
          <div className="steps-list">
            {p.steps.map((step: any, i: number) => (
              <div key={i} className="step-item">
                <p className="step-tag">{step.label}</p>
                <p className="step-body">{step.text}</p>
                {step.morse && <div className="morse-code">{step.morse}</div>}
                <p className="step-note">{step.subtext}</p>
              </div>
            ))}
          </div>
        )}

        {/* Answer */}
        <div className="answer-block">
          <p className="answer-tag">Submit Answer</p>
          <div className="answer-input-wrap">
            <input
              className={`answer-input ${state === "correct" ? "correct" : ""} ${state === "wrong" ? "wrong" : ""}`}
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="TYPE YOUR ANSWER..."
              disabled={solved || loading}
            />
          </div>
          <div className="submit-row">
            <button className="submit-btn" onClick={submit} disabled={solved || !answer.trim() || loading}>
              {solved ? "✓ SOLVED" : loading ? "CHECKING..." : "SUBMIT"}
            </button>
            {state === "correct" && <span className="feedback ok">✓ CORRECT — Loading results...</span>}
            {state === "wrong" && <span className="feedback err">✗ WRONG ANSWER</span>}
            {tries > 0 && state !== "correct" && <span className="tries">{tries} attempt{tries > 1 ? "s" : ""}</span>}
          </div>

          <div className="hint-area">
            {hintCount < 2 && (
              <button className="hint-trigger" onClick={revealHint}>
                {hintCount === 0 ? "request hint →" : "one more hint →"}
              </button>
            )}
            {hint && <div className="hint-reveal">〉 {hint}</div>}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="game-sidebar">
        <div className="sb-section">
          <p className="sb-label">Live Arena Stats</p>
          <div className="sb-stat"><span className="sb-stat-key">Attempting</span><span className="sb-stat-val">{liveStats.attempting > 0 ? liveStats.attempting : (Math.floor(Math.random() * 15) + 25)}</span></div>
          <div className="sb-stat"><span className="sb-stat-key">Total players</span><span className="sb-stat-val">{liveStats.players || (game.cap - 25)}</span></div>
          <div className="sb-stat"><span className="sb-stat-key">Prize pool</span><span className="sb-stat-val">₹{(game.cost * (liveStats.players || (game.cap - 25))).toLocaleString()}</span></div>
        </div>

        <div className="sb-section">
          <p className="sb-label">Intelligence Drops</p>
          {game.clues.map((c: any, i: number) => (
            visibleClues.includes(c) ? (
              <div key={i} className={`clue-card ${c.isRedHerring ? "rh" : "normal"}`}>
                <p className="clue-hour">Hour {c.hour} {c.isRedHerring ? "· ⚠ UNVERIFIED" : "· CONFIRMED"}</p>
                {c.text}
              </div>
            ) : (
              <div key={i} className="locked-clue-slot">Hour {c.hour} · Locked</div>
            )
          ))}
        </div>

        <div className="sb-section">
          <p className="sb-label">Live Leaderboard</p>
          {leaderboard.length === 0 ? (
           <div className="lb-entry" style={{ opacity: 0.5 }}><span className="lb-rank">—</span><span className="lb-num">NO SOLVES YET</span></div>
          ) : leaderboard.map((r, i) => (
            <div key={i} className="lb-entry">
              <span className="lb-rank">#{i + 1}</span>
              <span className="lb-num">Player {r.num}</span>
              <span className="lb-time">{r.time}</span>
            </div>
          ))}
          <div className="lb-entry" style={{ opacity: 0.35 }}>
            <span className="lb-rank">—</span>
            <span className="lb-num" style={{ fontStyle: "italic", color: "var(--dim)" }}>you?</span>
            <span className="lb-time">—</span>
          </div>
        </div>
      </div>
    </div>
  );
}
