import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/firebase";
import { doc, setDoc, updateDoc, increment } from "firebase/firestore";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json(
      { error: "Webhook signature invalid" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { userId, gameId } = session.metadata!;

    // Unlock the room for this user
    await setDoc(doc(db, "entries", `${userId}_${gameId}`), {
      userId,
      gameId,
      stripeSessionId: session.id,
      paid: true,
      solvedAt: null,
      attempts: 0,
      createdAt: new Date(),
    });

    // Update game stats
    await updateDoc(doc(db, "games", gameId), {
      playerCount: increment(1),
      prizePool: increment(session.amount_total! / 100),
    });
  }

  return NextResponse.json({ received: true });
}

// CRITICAL: Stripe needs raw body, not parsed JSON
export const config = { api: { bodyParser: false } };
