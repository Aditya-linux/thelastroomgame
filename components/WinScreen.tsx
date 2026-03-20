"use client";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { GAME_TIERS } from "@/lib/games";

export function WinScreen() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const gameId = searchParams.get("gameId") || "clubs";

  const tier = GAME_TIERS.find((t) => t.id === gameId);
  const playerNumber = (session?.user as any)?.playerNumber || "???";

  return (
    <div className="win-container">
      {/* Radial glow */}
      <div className="win-glow" />

      {/* Trophy / Badge */}
      <div className="win-badge">
        <div className="win-badge-inner">
          <span className="win-crown">👑</span>
          <span className="win-suit" style={{ color: tier?.color }}>
            {tier?.suitSymbol || "♠"}
          </span>
        </div>
      </div>

      <h1 className="win-headline">YOU SURVIVED</h1>
      <p className="win-subtitle">
        Player #{playerNumber} — The Last Room has been conquered.
      </p>

      <div className="win-prize-card">
        <span className="win-prize-label">YOUR PRIZE</span>
        <span className="win-prize-amount">
          70% of Prize Pool
        </span>
        <span className="win-prize-note">
          You&apos;ll receive an email with payout instructions.
        </span>
      </div>

      {/* Share */}
      <div className="win-share">
        <p className="share-prompt">PROVE IT.</p>
        <button
          className="share-button"
          onClick={() => {
            const text = `I survived The Last Room — ${tier?.name} tier. Player #${playerNumber}. 🏆 thelastroom.io`;
            if (navigator.share) {
              navigator.share({ text });
            } else {
              navigator.clipboard.writeText(text);
              alert("Copied to clipboard!");
            }
          }}
        >
          SHARE YOUR VICTORY
        </button>
      </div>

      <a href="/games" className="win-play-again">
        PLAY ANOTHER ROOM →
      </a>
    </div>
  );
}
