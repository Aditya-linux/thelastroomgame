import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc, increment } from "firebase/firestore";
import crypto from "crypto";
import { ANSWER_HASHES } from "@/lib/games";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { gameId, answer } = await req.json();

  // Verify they actually paid
  const entry = await getDoc(doc(db, "entries", `${userId}_${gameId}`));
  if (!entry.exists() || !entry.data()?.paid) {
    return NextResponse.json({ error: "No valid entry" }, { status: 403 });
  }

  // Increment attempts
  await updateDoc(doc(db, "entries", `${userId}_${gameId}`), {
    attempts: increment(1),
  });

  // Hash the submitted answer and compare
  const submitted = crypto
    .createHash("sha256")
    .update(answer.trim().toUpperCase())
    .digest("hex");

  const correct = submitted === ANSWER_HASHES[gameId];

  if (correct) {
    // Mark as solved
    await updateDoc(doc(db, "entries", `${userId}_${gameId}`), {
      solvedAt: new Date(),
    });

    // Check if first solver (winner)
    const gameDoc = await getDoc(doc(db, "games", gameId));
    const isFirstSolver = !gameDoc.data()?.winnerId;

    if (isFirstSolver) {
      await updateDoc(doc(db, "games", gameId), {
        winnerId: userId,
        winnerSolvedAt: new Date(),
      });
    }

    return NextResponse.json({ correct: true, firstSolver: isFirstSolver });
  }

  return NextResponse.json({ correct: false, firstSolver: false });
}
