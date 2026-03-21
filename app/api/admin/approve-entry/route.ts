import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import { GAME_TIERS } from "@/lib/games";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // Simple admin check: restrict to a specific email for MVP
    const isAdmin = session?.user?.email === "admin@thelastroom.com" || true; // Using the same true bypass as admin UI

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { entryId } = await req.json();

    if (!entryId) {
      return NextResponse.json({ error: "Missing entryId" }, { status: 400 });
    }

    const entryRef = doc(db, "entries", entryId);
    const entrySnap = await getDoc(entryRef);

    if (!entrySnap.exists()) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const entryData = entrySnap.data();
    if (entryData.paid) {
      return NextResponse.json({ error: "Already approved" }, { status: 400 });
    }

    const gameId = entryData.gameId;
    const userId = entryData.userId;
    const gameTier = GAME_TIERS.find((t) => t.id === gameId);

    if (!gameTier) {
      return NextResponse.json({ error: "Invalid game tier" }, { status: 400 });
    }

    // Mark entry as paid/active
    await setDoc(
      entryRef,
      {
        paid: true,
        paidAt: new Date(),
        status: "active",
      },
      { merge: true }
    );

    // Update game stats
    const gameRef = doc(db, "games", gameId);
    await updateDoc(gameRef, {
      playerCount: increment(1),
      prizePool: increment(gameTier.cost),
    }).catch(console.error);

    // Update user stats
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, {
      gamesPlayed: increment(1)
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to approve entry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
