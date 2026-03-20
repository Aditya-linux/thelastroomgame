"use client";
import { GAME_TIERS } from "@/lib/games";
import { GameCard } from "@/components/GameCard";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function GamesPage() {
  const { data: session } = useSession();

  return (
    <main className="games-page">
      <div className="bg-grid" />
      <div className="bg-glow bg-glow-1" />
      <div className="scanline" />

      {/* Nav */}
      <nav className="landing-nav">
        <Link href="/" className="nav-brand">
          <span className="brand-symbol">◈</span>
          <span className="brand-text">THE LAST ROOM</span>
        </Link>
        <div className="nav-right">
          {session ? (
            <div className="player-badge-nav">
              <span className="player-dot" />
              <span>
                Player #{(session.user as any).playerNumber || "???"}
              </span>
            </div>
          ) : (
            <button className="nav-login" onClick={() => signIn("google")}>
              SIGN IN
            </button>
          )}
        </div>
      </nav>

      {/* Page header */}
      <div className="games-header">
        <p className="korean-accent">문을 선택하세요</p>
        <h1 className="games-title">CHOOSE YOUR ROOM</h1>
        <p className="games-subtitle">
          Three doors. Three difficulty tiers. Only one leads to the prize.
          <br />
          Choose wisely — once you enter, <span className="emphasis">there is no going back.</span>
        </p>
      </div>

      {/* Game cards */}
      <div className="games-grid">
        {GAME_TIERS.map((tier) => (
          <GameCard key={tier.id} tier={tier} />
        ))}
      </div>

      {/* Rules */}
      <div className="games-rules">
        <h3>RULES OF THE ROOM</h3>
        <ul>
          <li>You have <strong>48 hours</strong> from game start to solve the puzzle.</li>
          <li>New clues are released every <strong>8 hours</strong>.</li>
          <li>The <strong>first player</strong> to submit the correct answer wins.</li>
          <li>Winner receives <strong>70%</strong> of the total prize pool.</li>
          <li>All answers are checked <strong>server-side</strong>. No cheating.</li>
        </ul>
      </div>
    </main>
  );
}
