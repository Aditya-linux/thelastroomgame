"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { GAME_TIERS, ANSWER_HASHES } from "@/lib/games";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeGames, setActiveGames] = useState<any[]>([]);
  const [triggering, setTriggering] = useState<string | null>(null);

  // Simple admin check: restrict to a specific email for MVP
  const isAdmin = session?.user?.email === "admin@thelastroom.com" || true; // Replace `true` with your admin's email or logic.

  useEffect(() => {
    fetchActiveGames();
  }, []);

  const fetchActiveGames = async () => {
    const querySnapshot = await getDocs(collection(db, "games"));
    setActiveGames(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const triggerHint = async (gameId: string) => {
    setTriggering(gameId);
    try {
      await fetch("/api/admin/trigger-hint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId })
      });
      setMessage(`Hint broadcasted in ${gameId}`);
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    }
    setTriggering(null);
  };

  const initializeDefaultGames = async () => {
    setLoading(true);
    try {
      for (const game of GAME_TIERS) {
        await setDoc(doc(db, "games", game.id), {
          ...game,
          answerHash: ANSWER_HASHES[game.id],
          status: "active",
          createdAt: new Date(),
          forceHints: 0
        });
      }
      setMessage("Default games initialized successfully!");
      fetchActiveGames();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
    setLoading(false);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="text-center p-8 border border-[rgba(255,45,107,0.35)] bg-[rgba(255,45,107,0.12)]">
          <h1 className="text-xl font-mono text-[#ff2d6b]">ACCESS DENIED</h1>
          <p className="mt-2 text-sm text-gray-400">You do not have operator privileges for the arena.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono p-8">
      <h1 className="text-2xl mb-8 border-b border-green-500 pb-2">OPERATOR VIEW: THE LAST ROOM</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Active Lobbies */}
        <div className="border border-green-500 p-4 bg-green-900/10">
          <h2 className="text-xl mb-4 text-green-400">ACTIVE LOBBIES</h2>
          <div className="space-y-4">
            {activeGames.map((game, i) => (
              <div key={i} className="border border-green-500/30 p-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg text-white">{game.name} ({game.id})</h3>
                  <span className={`text-xs px-2 py-1 ${game.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {game.status ? game.status.toUpperCase() : 'UNKNOWN'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  <p>Difficulty: {game.difficulty}</p>
                  <p>Cost: ${game.cost}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => triggerHint(game.id)}
                    disabled={triggering === game.id}
                    className="px-3 py-1 bg-green-500/20 border border-green-500 hover:bg-green-500/40 transition disabled:opacity-50"
                  >
                    {triggering === game.id ? "TRANSMITTING..." : "TRIGGER HINT TO ALL"}
                  </button>
                </div>
              </div>
            ))}
            {activeGames.length === 0 && (
              <p className="text-gray-500">No active lobbies found.</p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-8">
          <div className="border border-green-500 p-4 bg-green-900/10">
            <h2 className="text-xl mb-4 text-green-400">SYSTEM CONTROLS</h2>
            <button 
              onClick={initializeDefaultGames}
              disabled={loading}
              className="w-full text-left px-4 py-2 border border-green-500 hover:bg-green-500/20 transition disabled:opacity-50"
            >
              {loading ? "INITIALIZING..." : "> INITIALIZE DEFAULT GAMES (GAME_TIERS)"}
            </button>
            {message && <p className="mt-4 text-sm text-yellow-500">{message}</p>}
          </div>

          {/* Revenue */}
          <div className="border border-green-500 p-4 bg-green-900/10">
            <h2 className="text-xl mb-4 text-green-400">REVENUE (ESTIMATED)</h2>
            <p className="text-3xl text-white">${activeGames.reduce((acc, g) => acc + (g.prizePool || 0), 0).toFixed(2)}</p>
            <p className="text-sm mt-2 text-gray-400">Based on Razorpay live DB entries</p>
          </div>
        </div>
      </div>
    </div>
  );
}

