"use client";
import { GameTier } from "@/lib/games";
import { PayButton } from "./PayButton";

const SHAPE_SVG: Record<string, React.ReactNode> = {
  circle: (
    <svg viewBox="0 0 100 100" className="tier-shape">
      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  triangle: (
    <svg viewBox="0 0 100 100" className="tier-shape">
      <polygon points="50,5 95,95 5,95" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  square: (
    <svg viewBox="0 0 100 100" className="tier-shape">
      <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
};

export function GameCard({ tier }: { tier: GameTier }) {
  const difficultyBars = Array.from({ length: 10 }, (_, i) => (
    <div
      key={i}
      className={`difficulty-bar ${i < tier.difficulty ? "active" : ""}`}
      style={{
        backgroundColor: i < tier.difficulty ? tier.color : "rgba(255,255,255,0.06)",
      }}
    />
  ));

  return (
    <div
      className="game-card"
      style={{ "--card-accent": tier.color } as React.CSSProperties}
    >
      {/* Card top — suit pattern */}
      <div className="card-header">
        <div className="card-suit-bg">{tier.suitSymbol}</div>
        <div className="card-shape-container">
          {SHAPE_SVG[tier.shape]}
        </div>
        <div className="card-suit-label">{tier.suitSymbol}</div>
      </div>

      {/* Card body */}
      <div className="card-body">
        <h3 className="card-title">
          <span className="card-suit-icon" style={{ color: tier.color }}>
            {tier.suitSymbol}
          </span>
          {tier.name}
        </h3>

        <p className="card-description">{tier.description}</p>

        {/* Difficulty */}
        <div className="difficulty-section">
          <span className="difficulty-label">DIFFICULTY</span>
          <div className="difficulty-bars">{difficultyBars}</div>
          <span className="difficulty-value">{tier.difficulty}/10</span>
        </div>

        {/* Prize info */}
        <div className="card-prize-info">
          <div className="prize-row">
            <span className="prize-label">ENTRY FEE</span>
            <span className="prize-value" style={{ color: tier.color }}>
              ${tier.cost}
            </span>
          </div>
          <div className="prize-row">
            <span className="prize-label">YOUR SHARE</span>
            <span className="prize-value">70%</span>
          </div>
        </div>

        <PayButton gameId={tier.id} cost={tier.cost} />
      </div>
    </div>
  );
}
