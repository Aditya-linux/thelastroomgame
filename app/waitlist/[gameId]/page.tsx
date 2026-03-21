"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, collection, query, where } from "firebase/firestore";
import { GAME_TIERS } from "@/lib/games";

export default function WaitlistPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = React.use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [waitingCount, setWaitingCount] = useState<number>(0);
  const [accessGranted, setAccessGranted] = useState(false);
  
  const game = GAME_TIERS.find((t) => t.id === gameId);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
      return;
    }

    if (!session?.user || !game) return;
    const userId = (session.user as any).id;
    const entryId = `${userId}_${game.id}`;

    // Listen to personal entry status
    const unsubEntry = onSnapshot(doc(db, "entries", entryId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.paid && data.status === "active") {
          setAccessGranted(true);
          setTimeout(() => {
            router.push(`/room/${game.id}`);
          }, 1500);
        }
      }
    });

    // Listen to live waiting queue count for this game
    const q = query(collection(db, "entries"), where("gameId", "==", game.id), where("status", "==", "pending"));
    const unsubQueue = onSnapshot(q, (snap) => {
      setWaitingCount(snap.size);
    });

    return () => {
      unsubEntry();
      unsubQueue();
    };
  }, [session, status, game, router, gameId]);

  if (!game) return <div style={{ color: "var(--muted)", textAlign: "center", padding: "40px" }}>INVALID GAME</div>;

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-8" style={{ "--game-color": game.color } as React.CSSProperties}>
      <div className="max-w-md w-full border border-[var(--game-color)] bg-[rgba(0,0,0,0.5)] p-8 text-center" style={{ boxShadow: `0 0 20px ${game.colorDim}` }}>
        <p className="text-sm tracking-widest text-[var(--muted)] mb-2">VERIFICATION PROTOCOL</p>
        <h1 className="text-2xl mb-6" style={{ color: game.color }}>PAYMENT PENDING</h1>
        
        {accessGranted ? (
          <div className="animate-pulse text-green-500 mb-6">
            <p className="text-xl">✓ ACCESS GRANTED</p>
            <p className="text-xs mt-2 text-gray-400">Rerouting to {game.suitName} game...</p>
          </div>
        ) : (
          <div className="mb-8">
            <div className="inline-block w-8 h-8 border-2 border-t-[var(--game-color)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-gray-300">Waiting for Operator to verify your payment of ₹{game.cost}.</p>
            <p className="text-xs text-gray-500 mt-2">Do not close this page.</p>
          </div>
        )}

        <div className="border-t border-[var(--game-color)] opacity-50 pt-4 mt-8 flex justify-between items-center text-xs text-[var(--muted)]">
          <span>LIVE QUEUE</span>
          <span>{waitingCount} PLAYERS WAITING</span>
        </div>
      </div>
    </div>
  );
}
