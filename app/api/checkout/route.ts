import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { stripe } from "@/lib/stripe";
import { PRICE_IDS } from "@/lib/games";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { gameId } = await req.json();

  // Check if user already paid for this game
  const userId = (session.user as any).id;
  const entryRef = doc(db, "entries", `${userId}_${gameId}`);
  const existing = await getDoc(entryRef);
  if (existing.exists() && existing.data().paid) {
    return NextResponse.json({ alreadyPaid: true, gameId });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      { price: PRICE_IDS[gameId as keyof typeof PRICE_IDS], quantity: 1 },
    ],
    success_url: `${process.env.NEXTAUTH_URL}/room/${gameId}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/games`,
    customer_email: session.user.email,
    metadata: {
      userId,
      gameId,
    },
    payment_method_options: {
      card: { request_three_d_secure: "automatic" },
    },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
