import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { PuzzleRoom } from "@/components/PuzzleRoom";

export default async function RoomPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const session = await getServerSession(authOptions);

  // Not logged in → send to sign in
  if (!(session?.user as any)?.id) {
    redirect(`/games?msg=login_required`);
  }

  const userId = (session!.user as any).id;

  // Check payment in Firestore
  const entry = await getDoc(doc(db, "entries", `${userId}_${gameId}`));

  // Not paid → send to games page
  if (!entry.exists() || !entry.data()?.paid) {
    redirect("/games?unpaid=true");
  }

  // Already solved
  if (entry.data()?.solvedAt) {
    redirect(`/win?gameId=${gameId}`);
  }

  return <PuzzleRoom gameId={gameId} userId={userId} />;
}
