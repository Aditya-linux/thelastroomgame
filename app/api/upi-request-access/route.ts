import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
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

    // Register pending payment entry
    await setDoc(
      entryRef,
      {
        userId,
        gameId,
        paid: false,
        status: "pending",
        attempts: 0,
        requestedAt: new Date(),
      },
      { merge: true }
    );

    console.log(`[TEST MODE] ${userId} requested UPI access to ${gameId}`);

    return NextResponse.json({ success: true, entryId });
  } catch (error) {
    console.error("Failed to request UPI access:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
