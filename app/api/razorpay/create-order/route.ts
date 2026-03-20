import { razorpay } from "@/lib/razorpay";
import { db } from "@/lib/firebase";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import { GAME_TIERS } from "@/lib/games";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { gameId } = await req.json();
    const game = GAME_TIERS.find((g) => g.id === gameId);

    if (!game) {
      return NextResponse.json({ error: "Invalid game" }, { status: 400 });
    }

    const user = session.user as any;

    // Check if already paid
    const q = query(
      collection(db, "entries"),
      where("userId", "==", user.id),
      where("gameId", "==", gameId),
      where("paid", "==", true)
    );
    const existing = await getDocs(q);
    if (!existing.empty) {
      return NextResponse.json({ error: "Already purchased" }, { status: 400 });
    }

    // Create Razorpay Order
    // Amount is in currency subunits (paise for INR)
    const options = {
      amount: game.cost * 100 * 85, // Simple conversion from USD to INR (~85) if needed, or stick to a fixed amount
      currency: "INR",
      receipt: `receipt_${gameId}_${Date.now()}`,
      notes: {
        userId: user.id,
        gameId: gameId,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error("Razorpay Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
