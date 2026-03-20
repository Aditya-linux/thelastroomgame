import crypto from "crypto";

export interface GameTier {
  id: string;
  name: string;
  suit: string;
  suitSymbol: string;
  cost: number;
  difficulty: number;
  shape: string;
  color: string;
  description: string;
}

export const GAME_TIERS: GameTier[] = [
  {
    id: "clubs",
    name: "Clubs",
    suit: "clubs",
    suitSymbol: "♣",
    cost: 5,
    difficulty: 3,
    shape: "circle",
    color: "#00F5FF",
    description: "Visual puzzle — Pattern recognition. Find the word hidden in the grid.",
  },
  {
    id: "diamonds",
    name: "Diamonds",
    suit: "diamonds",
    suitSymbol: "♦",
    cost: 10,
    difficulty: 7,
    shape: "triangle",
    color: "#FFD700",
    description: "Cipher puzzle — Decode the encrypted message to find the answer.",
  },
  {
    id: "spades",
    name: "Spades",
    suit: "spades",
    suitSymbol: "♠",
    cost: 20,
    difficulty: 10,
    shape: "square",
    color: "#FF2D6B",
    description: "Meta puzzle — Multi-step challenge. Only the sharpest minds survive.",
  },
];

// Answers stored as SHA256 hashes — never in plaintext
export const ANSWER_HASHES: Record<string, string> = {
  clubs: crypto.createHash("sha256").update("MIRROR").digest("hex"),
  diamonds: crypto.createHash("sha256").update("THE ROOM NEVER CLOSES").digest("hex"),
  spades: crypto.createHash("sha256").update("1980SHINING").digest("hex"),
};
