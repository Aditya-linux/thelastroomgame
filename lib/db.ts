import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { GameTier } from "./games";

export async function getGamesFromFirestore(): Promise<GameTier[]> {
  const gamesCollection = collection(db, "games");
  const gamesSnapshot = await getDocs(gamesCollection);
  if (gamesSnapshot.empty) {
    return [];
  }
  return gamesSnapshot.docs.map(doc => doc.data() as GameTier);
}

export async function getGameFromFirestore(id: string): Promise<GameTier | null> {
  const gameDoc = await getDoc(doc(db, "games", id));
  if (gameDoc.exists()) {
    return gameDoc.data() as GameTier;
  }
  return null;
}
