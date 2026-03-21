import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { GAME_TIERS } from "@/lib/games";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gameId } = await req.json();

    if (!gameId) {
      return NextResponse.json({ error: "Missing gameId" }, { status: 400 });
    }

    const gameTier = GAME_TIERS.find((t) => t.id === gameId);
    if (!gameTier) {
      return NextResponse.json({ error: "Invalid game tier" }, { status: 404 });
    }

    const entryId = `${userId}_${gameId}`;
    const entryRef = doc(db, "entries", entryId);
    const entrySnap = await getDoc(entryRef);

    if (entrySnap.exists() && entrySnap.data()?.paid) {
      // User already bought this game
      return NextResponse.json({ error: "Already purchased", id: entryId });
    }

    // Mock successful payment for test mode
    await setDoc(
      entryRef,
      {
        userId,
        gameId,
        paid: true,
        paidAt: new Date(),
        status: "active",
        attempts: 0,
      },
      { merge: true }
    );

    // Update game stats
    const gameRef = doc(db, "games", gameId);
    await updateDoc(gameRef, {
      playerCount: increment(1),
      prizePool: increment(gameTier.cost), // Prize pool incremented by cost amount
    }).catch(console.error); // Ignore error if game doc doesn't strictly exist yet

    // Update user stats
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      gamesPlayed: increment(1)
    }, { merge: true });

    console.log(`✅ [TEST MODE] UPI Payment Verified: ${userId} unlocked ${gameId}`);

    return NextResponse.json({ success: true, entryId });
  } catch (error) {
    console.error("Failed to mock UPI success:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
