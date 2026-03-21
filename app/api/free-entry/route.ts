import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { GAME_TIERS } from "@/lib/games";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gameId } = await req.json();
    if (!gameId) {
      return NextResponse.json({ error: "Missing gameId" }, { status: 400 });
    }

    // 1. Validate the game is actually free and Auto-Heal if necessary
    const gameRef = doc(db, "games", gameId);
    let gameSnap = await getDoc(gameRef);
    let gameData = gameSnap.data();

    if (!gameSnap.exists()) {
      // Auto-Heal: The game is missing from the database.
      // We only save essential METADATA. The frontend will use GAME_TIERS for the actual puzzle content.
      const baseTier = GAME_TIERS.find(t => t.id === gameId);
      if (baseTier) {
        await setDoc(gameRef, { 
          id: baseTier.id,
          name: baseTier.name,
          suit: baseTier.suit,
          suitName: baseTier.suitName,
          cost: baseTier.cost,
          difficulty: baseTier.difficulty,
          status: "active", 
          createdAt: new Date(),
          playerCount: 0,
          prizePool: 0,
          forceHints: 0
        });
        gameData = { ...baseTier, playerCount: 0 };
      } else {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
      }
    }

    const userId = (session.user as any).id;
    const entryId = `${userId}_${gameId}`;
    const entryRef = doc(db, "entries", entryId);

    // Force create/update entry as paid for the donation model
    await setDoc(entryRef, {
      userId,
      gameId,
      paid: true,
      paidAt: new Date(),
      status: "active",
      attempts: 0,
      amount: 0,
    }, { merge: true });

    // Update user stats
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      await updateDoc(userRef, {
        gamesPlayed: increment(1),
      });
    } else {
      await setDoc(userRef, {
        gamesPlayed: 1,
        gamesWon: 0,
        totalPrizeMoney: 0,
        badges: [],
      });
    }

    return NextResponse.json({ success: true, entryId });
  } catch (error: any) {
    console.error("Free entry error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
