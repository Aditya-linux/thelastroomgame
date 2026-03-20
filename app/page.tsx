"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Countdown } from "@/components/Countdown";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();
  const [endsAt] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 48);
    return d;
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <main className="landing">
      {/* Background effects */}
      <div className="bg-grid" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="scanline" />

      {/* Floating shapes */}
      <div className="float-shape shape-circle" />
      <div className="float-shape shape-triangle" />
      <div className="float-shape shape-square" />

      {/* Nav */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="brand-symbol">◈</span>
          <span className="brand-text">THE LAST ROOM</span>
        </div>
        <div className="nav-right">
          {session ? (
            <div className="player-badge-nav">
              <span className="player-dot" />
              <span>
                Player #
                {(session.user as any).playerNumber || "???"}
              </span>
            </div>
          ) : (
            <button
              className="nav-login"
              onClick={() => signIn("google")}
            >
              SIGN IN
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          {/* Korean accent text */}
          <p className="korean-accent">마지막 방</p>

          <h1 className="hero-title">
            THE LAST <span className="hero-highlight">ROOM</span>
          </h1>

          <p className="hero-subtitle">
            48 hours. One puzzle. One winner.
            <br />
            <span className="hero-emphasis">Do you dare enter?</span>
          </p>

          {/* Countdown */}
          {mounted && (
            <div className="hero-countdown">
              <Countdown endsAt={endsAt} />
            </div>
          )}

          {/* Stats */}
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">3</span>
              <span className="hero-stat-label">ROOMS</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">48h</span>
              <span className="hero-stat-label">TIME LIMIT</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">70%</span>
              <span className="hero-stat-label">WINNER TAKES</span>
            </div>
          </div>

          {/* CTA */}
          <div className="hero-cta">
            <Link href="/games" className="cta-button primary">
              <span className="cta-icon">▶</span>
              ENTER THE ROOMS
            </Link>
          </div>

          {/* Tiers preview */}
          <div className="tier-preview">
            <div className="tier-chip" style={{ borderColor: "#00F5FF" }}>
              <span style={{ color: "#00F5FF" }}>♣</span> Clubs · $5
            </div>
            <div className="tier-chip" style={{ borderColor: "#FFD700" }}>
              <span style={{ color: "#FFD700" }}>♦</span> Diamonds · $10
            </div>
            <div className="tier-chip" style={{ borderColor: "#FF2D6B" }}>
              <span style={{ color: "#FF2D6B" }}>♠</span> Spades · $20
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <h2 className="section-title">HOW IT WORKS</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <h3>CHOOSE YOUR ROOM</h3>
            <p>Three difficulty tiers. Higher stakes, harder puzzles, bigger prizes.</p>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <h3>PAY TO ENTER</h3>
            <p>One-time entry fee. Stripe checkout. Apple Pay & Google Pay accepted.</p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <h3>SOLVE THE PUZZLE</h3>
            <p>You have 48 hours. Clues drop every 8 hours. First solver wins.</p>
          </div>
          <div className="step-card">
            <div className="step-number">04</div>
            <h3>CLAIM YOUR PRIZE</h3>
            <p>Winner takes 70% of the total prize pool. Paid out within 48 hours.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-brand">
          <span className="brand-symbol">◈</span> THE LAST ROOM
        </div>
        <div className="footer-links">
          <span>Vol.01</span>
          <span>·</span>
          <span>Terms</span>
          <span>·</span>
          <span>Privacy</span>
        </div>
        <p className="footer-disclaimer">
          Skill-based contest. Not gambling. No purchase necessary — see rules for free entry method.
        </p>
      </footer>
    </main>
  );
}
