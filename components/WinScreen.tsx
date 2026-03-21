"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { GAME_TIERS } from "@/lib/games";

const pad = (n: number | string) => String(n).padStart(2, "0");

export function WinScreen() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const router = useRouter();
  
  const gameId = searchParams.get("gameId") || "clubs";
  const game = GAME_TIERS.find((t) => t.id === gameId);
  const playerNum = (session?.user as any)?.playerNumber || "???";

  const tries = parseInt(searchParams.get("tries") || "1", 10);
  const h = parseInt(searchParams.get("h") || "0", 10);
  const m = parseInt(searchParams.get("m") || "0", 10);
  const s = parseInt(searchParams.get("s") || "0", 10);

  if (!game) return <div>Invalid game</div>;

  const pool = game.cost * (game.cap - 25);
  const prize = Math.floor(pool * game.winPercent / 100);
  const shareText = `Player ${playerNum} cleared ${game.suitName} ${game.suit} — The Last Room Vol.01. Prize: $${prize.toLocaleString()}. ${tries} attempt${tries > 1 ? "s" : ""}. Think you can beat that? thelastroom.io`;

  return (
    <div className="win-wrap" style={{ "--win-color": game.color } as React.CSSProperties}>
      <div className="win-bg-suit">{game.suit}</div>
      <div className="win-content">
        <p className="win-player-tag">PLAYER {playerNum} · {game.shape} {game.shapeLabel} CLEARED</p>
        <div className="win-suit">{game.suit}</div>
        <h1 className="win-headline">GAME<br/>CLEAR</h1>
        <p className="win-subline">You saw what {game.cap - 26} others could not.</p>

        <div className="win-stats">
          <div className="win-stats-header">RESULT — {game.suitName} GAME</div>
          <div className="win-stat-row"><span className="win-stat-key">Game</span><span className="win-stat-val" style={{ color: game.color }}>{game.suit} {game.suitName}</span></div>
          <div className="win-stat-row"><span className="win-stat-key">Attempts</span><span className="win-stat-val">{tries}</span></div>
          <div className="win-stat-row"><span className="win-stat-key">Time remaining</span><span className="win-stat-val">{pad(h)}:{pad(m)}:{pad(s)}</span></div>
          <div className="win-stat-row"><span className="win-stat-key">Prize pool</span><span className="win-stat-val">${pool.toLocaleString()}</span></div>
          <div className="win-stat-row"><span className="win-stat-key">Your prize</span><span className="win-stat-val prize">${prize.toLocaleString()}</span></div>
        </div>

        <div className="win-share-quote">"{shareText}"</div>

        <div className="win-actions">
          <button className="win-copy-btn" onClick={() => { 
            navigator.clipboard.writeText(shareText).catch(() => {}); 
            alert("Copied!"); 
          }}>
            COPY & SHARE
          </button>
          <button className="win-lobby-btn" onClick={() => router.push("/")}>BACK TO LOBBY</button>
        </div>
      </div>
    </div>
  );
}
