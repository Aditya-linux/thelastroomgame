import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { gameId } = await req.json();

  // Validate the game is actually free
  const gameDoc = await getDoc(doc(db, "games", gameId));
  if (!gameDoc.exists()) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const gameData = gameDoc.data();
  if (gameData.cost !== 0) {
    return NextResponse.json({ error: "Game requires payment" }, { status: 400 });
  }

  const entryId = `${userId}_${gameId}`;
  const entryRef = doc(db, "entries", entryId);

  // Grant free entry
  await setDoc(
    entryRef,
    {
      userId,
      gameId,
      paid: true, // we mark it as paid so the room logic allows entry
      paidAt: new Date(),
      status: "active",
      attempts: 0,
    },
    { merge: true }
  );

  // Update stats
  await updateDoc(doc(db, "games", gameId), {
    playerCount: increment(1),
  });

  await setDoc(doc(db, "users", userId), {
    gamesPlayed: increment(1)
  }, { merge: true });

  return NextResponse.json({ success: true });
}
