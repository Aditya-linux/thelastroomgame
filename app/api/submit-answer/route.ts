import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc, increment, setDoc } from "firebase/firestore";
import crypto from "crypto";
import { razorpay } from "@/lib/razorpay";

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

  // Fetch the dynamic game info from Firestore
  const gameDoc = await getDoc(doc(db, "games", gameId));
  if (!gameDoc.exists()) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
  const gameData = gameDoc.data();

  // Hash the submitted answer and compare to the Firestore answerHash
  const submitted = crypto
    .createHash("sha256")
    .update(answer.trim().toUpperCase())
    .digest("hex");

  const correct = submitted === gameData.answerHash;

  if (correct) {
    // Mark as solved
    await updateDoc(doc(db, "entries", `${userId}_${gameId}`), {
      solvedAt: new Date(),
    });

    // Check if first solver (winner)
    const isFirstSolver = !gameData.winnerId;

    if (isFirstSolver) {
      await updateDoc(doc(db, "games", gameId), {
        winnerId: userId,
        winnerSolvedAt: new Date(),
      });

      // Calculate the payout
      const prizePool = gameData.prizePool || 0;
      const winPercent = gameData.winPercent || 20;
      const amountToWinner = Math.floor((prizePool * winPercent) / 100);

      // Increment user stats
      const userRef = doc(db, "users", userId);
      await setDoc(userRef, {
        gamesWon: increment(1),
        totalPrizeMoney: increment(amountToWinner),
      }, { merge: true });

      // Automated Payout Transfer via Razorpay Route
      try {
        const userDocSnapshot = await getDoc(userRef);
        const payoutAccount = userDocSnapshot.data()?.payoutAccount;

        if (payoutAccount && amountToWinner > 0) {
          await razorpay.transfers.create({
            account: payoutAccount,
            amount: amountToWinner * 100, // INR in paise
            currency: "INR",
            notes: {
              gameId,
              userId,
              reason: "Winner Payout"
            }
          });
          console.log(`✅ Automated Payout Triggered for ${userId}: ${amountToWinner} INR`);
        } else {
          console.log(`⚠ Winner ${userId} has no payout account. Contact manually.`);
        }
      } catch (err: any) {
        console.error("⚠ Razorpay Transfer Failed:", err.message);
      }
    }

    return NextResponse.json({ correct: true, firstSolver: isFirstSolver });
  }

  return NextResponse.json({ correct: false, firstSolver: false });
}


