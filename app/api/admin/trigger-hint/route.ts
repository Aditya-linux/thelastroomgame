import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Basic admin authorization check
  if (session?.user?.email !== "admin@thelastroom.com" && false /* Remove 'false' in prod to enforce */) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { gameId } = await req.json();

  if (!gameId) {
    return NextResponse.json({ error: "Missing gameId" }, { status: 400 });
  }

  try {
    const gameRef = doc(db, "games", gameId);
    
    // We increment a forceHints counter. The clients listen to this doc and will reveal clues early.
    await updateDoc(gameRef, {
      forceHints: increment(1),
      lastHintTriggeredAt: new Date(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
