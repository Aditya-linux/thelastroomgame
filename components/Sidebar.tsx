"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";

interface GameStats {
  playerCount: number;
  prizePool: number;
}

interface Solver {
  userId: string;
  solvedAt: any;
}

export function LiveSidebar({ gameId }: { gameId: string }) {
  const [stats, setStats] = useState<GameStats>({
    playerCount: 0,
    prizePool: 0,
  });
  const [solvers, setSolvers] = useState<Solver[]>([]);

  useEffect(() => {
    // Live game stats
    const gameUnsub = onSnapshot(doc(db, "games", gameId), (snap) => {
      if (snap.exists()) setStats(snap.data() as GameStats);
    });

    // Live solver list
    const solversUnsub = onSnapshot(
      query(
        collection(db, "entries"),
        where("gameId", "==", gameId),
        where("solvedAt", "!=", null),
        orderBy("solvedAt", "asc"),
        limit(10)
      ),
      (snap) => setSolvers(snap.docs.map((d) => d.data() as Solver))
    );

    return () => {
      gameUnsub();
      solversUnsub();
    };
  }, [gameId]);

  return (
    <aside className="live-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-live-dot" />
        <span>LIVE</span>
      </div>

      <div className="sidebar-stat">
        <span className="stat-label">PLAYERS</span>
        <span className="stat-value">{stats.playerCount}</span>
      </div>

      <div className="sidebar-stat">
        <span className="stat-label">PRIZE POOL</span>
        <span className="stat-value prize">${stats.prizePool}</span>
      </div>

      <div className="sidebar-divider" />

      <div className="sidebar-solvers">
        <h4 className="solvers-title">SOLVED BY</h4>
        {solvers.length === 0 ? (
          <p className="no-solvers">No one... yet.</p>
        ) : (
          solvers.map((s, i) => (
            <div key={i} className="solver-entry">
              <span className="solver-rank">#{i + 1}</span>
              <span className="solver-id">
                Player {s.userId.slice(0, 6)}
              </span>
              {i === 0 && <span className="solver-winner">👑</span>}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
