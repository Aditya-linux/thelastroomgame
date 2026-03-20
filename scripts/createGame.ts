/**
 * Admin script — Create a new game session (Vol.01)
 * 
 * Run this from your machine to start a new 48-hour game cycle:
 *   npx tsx scripts/createGame.ts
 * 
 * Make sure your .env.local is loaded or env vars are set.
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(config);
const db = getFirestore(app);

async function createGameSession() {
  const endsAt = new Date();
  endsAt.setHours(endsAt.getHours() + 48);

  // Create room volume
  await setDoc(doc(db, "rooms", "vol1"), {
    active: true,
    startedAt: new Date(),
    endsAt,
    volume: 1,
  });

  // Create each game
  for (const gameId of ["clubs", "diamonds", "spades"]) {
    await setDoc(doc(db, "games", gameId), {
      active: true,
      playerCount: 0,
      prizePool: 0,
      winnerId: null,
      endsAt,
    });
  }

  console.log("✅ Game session created!");
  console.log(`   Ends at: ${endsAt.toISOString()}`);
  console.log("   Games: clubs, diamonds, spades");
}

createGameSession().catch(console.error);
