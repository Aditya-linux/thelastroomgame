import { db } from "@/lib/firebase";
import { NextResponse } from "next/server";
import { doc, getDoc, setDoc, updateDoc, increment } from "firebase/firestore";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Verify Webhook Signature
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  // Handle successful payment
  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;
    const { userId, gameId } = payment.notes;

    if (userId && gameId) {
      const entryId = `${userId}_${gameId}`;
      const entryRef = doc(db, "entries", entryId);

      await setDoc(
        entryRef,
        {
          userId,
          gameId,
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
        prizePool: increment(payment.amount / 100), // Prize in INR
      });

      console.log(`✅ Razorpay Payment Verified: ${userId} unlocked ${gameId}`);
    }
  }

  return NextResponse.json({ received: true });
}
