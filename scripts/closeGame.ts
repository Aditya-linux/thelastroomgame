/**
 * Admin script — Close a game and notify the winner
 * 
 * Run: npx tsx scripts/closeGame.ts clubs
 * 
 * This will:
 * 1. Look up the winner from Firestore
 * 2. Calculate the prize (70% of pool)
 * 3. Send an email to the winner via Resend
 * 4. Mark the game as closed
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(config);
const db = getFirestore(app);

async function closeGame(gameId: string) {
  const game = await getDoc(doc(db, "games", gameId));
  if (!game.exists()) {
    console.log("❌ Game not found");
    return;
  }

  const { winnerId, prizePool } = game.data()!;

  if (!winnerId) {
    console.log("⚠️  No winner yet for this game.");
    return;
  }

  const winner = await getDoc(doc(db, "players", winnerId));
  const winnerEmail = winner.data()!.email;
  const winnerPrize = Math.floor(prizePool * 0.7 * 100); // cents

  // Send winner email via Resend
  const emailRes = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "rooms@thelastroom.io",
      to: winnerEmail,
      subject: "You solved The Last Room — Claim your prize",
      html: `
        <div style="background:#0A0A0F;color:#E8E8ED;padding:40px;font-family:system-ui;">
          <h1 style="color:#FFD700;">👑 You Survived The Last Room</h1>
          <p>Congratulations, Player.</p>
          <p>You won <strong style="color:#FFD700;">$${winnerPrize / 100}</strong> from the ${gameId} room.</p>
          <p>Reply to this email with your PayPal email address to claim your prize.</p>
          <hr style="border-color:#222;" />
          <p style="color:#666;font-size:12px;">The Last Room · Vol.01</p>
        </div>
      `,
    }),
  });

  if (emailRes.ok) {
    console.log(`✅ Winner email sent to ${winnerEmail}`);
  } else {
    console.log("❌ Failed to send email:", await emailRes.text());
  }

  await updateDoc(doc(db, "games", gameId), {
    closed: true,
    payoutSent: true,
  });

  console.log(`✅ Game "${gameId}" closed.`);
  console.log(`   Winner: ${winnerEmail}`);
  console.log(`   Prize: $${winnerPrize / 100}`);
}

const gameId = process.argv[2];
if (!gameId) {
  console.log("Usage: npx tsx scripts/closeGame.ts <gameId>");
  console.log("Example: npx tsx scripts/closeGame.ts clubs");
  process.exit(1);
}

closeGame(gameId).catch(console.error);
