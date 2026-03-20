import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.id) {
    return NextResponse.json({ paid: false });
  }

  const gameId = req.nextUrl.searchParams.get("gameId");
  const userId = (session!.user as any).id;
  const entry = await getDoc(doc(db, "entries", `${userId}_${gameId}`));

  return NextResponse.json({
    paid: entry.exists() && entry.data()?.paid === true,
  });
}
