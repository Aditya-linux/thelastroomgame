"use client";
import { useState, useEffect } from "react";
import { LiveSidebar } from "./Sidebar";
import { Countdown } from "./Countdown";
import { GAME_CLUES, getVisibleClues } from "@/lib/clues";

// ── PUZZLE DATA ──
const CLUBS_GRID = [
  ["M", "A", "R", "T", "I", "N"],
  ["I", "N", "O", "R", "T", "H"],
  ["R", "E", "D", "S", "K", "Y"],
  ["R", "I", "V", "E", "R", "S"],
  ["O", "P", "E", "N", "E", "D"],
  ["R", "S", "L", "E", "E", "P"],
];

const DIAMONDS_CIPHER = "WKH URRP QHYHU FORVHV";

const SPADES_MORSE =
  "- .... . / --- ...- . .-. .-.. --- --- -.- / .... --- - . .-..";

interface PuzzleRoomProps {
  gameId: string;
  userId: string;
}

export function PuzzleRoom({ gameId, userId }: PuzzleRoomProps) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<{
    correct: boolean;
    firstSolver: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [clues, setClues] = useState(
    getVisibleClues(new Date(), GAME_CLUES[gameId] || [])
  );

  // Demo countdown — 48 hours from now (in production, fetch endsAt from Firestore)
  const [endsAt] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 48);
    return d;
  });

  // Update visible clues every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setClues(getVisibleClues(new Date(), GAME_CLUES[gameId] || []));
    }, 60000);
    return () => clearInterval(interval);
  }, [gameId]);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId, answer }),
      });
      const data = await res.json();
      setResult(data);
      setAttempts((a) => a + 1);

      if (data.correct) {
        window.location.href = `/win?gameId=${gameId}`;
      }
    } catch {
      // Error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="puzzle-room">
      <div className="puzzle-main">
        {/* Header */}
        <div className="puzzle-header">
          <div className="puzzle-room-label">
            <span className="room-tag">ROOM</span>
            <span className="room-name">
              {gameId.toUpperCase()}
            </span>
          </div>
          <div className="player-badge">
            <span className="player-icon">●</span>
            <span className="player-id">{userId.slice(0, 8)}</span>
          </div>
        </div>

        <Countdown endsAt={endsAt} />

        {/* Puzzle content */}
        <div className="puzzle-content">
          {gameId === "clubs" && <ClubsPuzzle />}
          {gameId === "diamonds" && <DiamondsPuzzle />}
          {gameId === "spades" && <SpadesPuzzle />}
        </div>

        {/* Clues */}
        <div className="clues-section">
          <h3 className="clues-title">
            <span className="clue-icon">🔍</span> CLUES RELEASED
          </h3>
          {clues.length === 0 ? (
            <p className="no-clues">No clues available yet. Check back later.</p>
          ) : (
            clues.map((c) => (
              <div key={c.id} className="clue-card">
                <span className="clue-number">#{c.id}</span>
                <span className="clue-text">{c.text}</span>
              </div>
            ))
          )}
          <p className="clue-next">
            New clues drop every 8 hours.
          </p>
        </div>

        {/* Answer submission */}
        <div className="answer-section">
          <div className="answer-input-group">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="ENTER YOUR ANSWER..."
              className="answer-input"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !answer.trim()}
              className="submit-button"
            >
              {loading ? "CHECKING..." : "SUBMIT"}
            </button>
          </div>

          {result && !result.correct && (
            <div className="answer-wrong">
              <span>✕ INCORRECT</span>
              <span className="attempt-count">Attempt #{attempts}</span>
            </div>
          )}
        </div>
      </div>

      <LiveSidebar gameId={gameId} />
    </div>
  );
}

/* ── CLUBS PUZZLE: Word Grid ── */
function ClubsPuzzle() {
  return (
    <div className="puzzle-type">
      <h2 className="puzzle-title">♣ GRID SEARCH</h2>
      <p className="puzzle-instruction">
        A word is hidden in this grid. Look carefully — not every answer runs
        horizontally.
      </p>
      <div className="word-grid">
        {CLUBS_GRID.map((row, ri) => (
          <div key={ri} className="grid-row">
            {row.map((cell, ci) => (
              <div key={ci} className="grid-cell">
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── DIAMONDS PUZZLE: Caesar Cipher ── */
function DiamondsPuzzle() {
  return (
    <div className="puzzle-type">
      <h2 className="puzzle-title">♦ CIPHER</h2>
      <p className="puzzle-instruction">
        Decode the following encrypted message. The answer is the decoded
        plaintext.
      </p>
      <div className="cipher-display">
        <div className="cipher-text">{DIAMONDS_CIPHER}</div>
        <div className="cipher-hint">
          <span className="hint-label">HINT:</span> Julius Caesar sent messages
          this way.
        </div>
      </div>
    </div>
  );
}

/* ── SPADES PUZZLE: Multi-step ── */
function SpadesPuzzle() {
  return (
    <div className="puzzle-type">
      <h2 className="puzzle-title">♠ MULTI-STEP</h2>
      <p className="puzzle-instruction">
        Decode the morse code below. The answer is a year + a word, no spaces,
        all lowercase.
      </p>
      <div className="cipher-display">
        <div className="morse-text">{SPADES_MORSE}</div>
        <div className="cipher-hint">
          <span className="hint-label">STEP 1:</span> Decode the morse.
          <br />
          <span className="hint-label">STEP 2:</span> Identify the famous
          place.
          <br />
          <span className="hint-label">STEP 3:</span> Find the film.
          <br />
          <span className="hint-label">STEP 4:</span> Combine year + title.
        </div>
      </div>
    </div>
  );
}
